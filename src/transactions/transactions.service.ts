import { Injectable } from '@nestjs/common';
import { Transaction } from './transactions.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

import { NftService } from '../nft/nft.service';
import { getWeb3 } from '../utils/web3';

interface QueryTransMarket {
  isMarket?: boolean;
  address?: string;
  refCode?: string;
}
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private readonly nftService: NftService,
  ) {}

  async findAll(query: QueryTransactionDto) {
    const { page, limit, isMarket, refCode, address } = query;

    const queryTemp: QueryTransMarket = { isMarket: true };

    if (address) {
      queryTemp.address = address.toLowerCase();
    }

    if (refCode) {
      queryTemp.refCode = refCode;
    }

    const [data, count] = await this.transactionsRepository.findAndCount({
      where: queryTemp,

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async findTransMarket(query: QueryTransMarket) {
    const { address, refCode } = query;

    const queryTemp: QueryTransMarket = { isMarket: true };

    if (address) {
      queryTemp.address = address.toLowerCase();
    }

    if (refCode) {
      queryTemp.refCode = refCode;
    }

    const data = await this.transactionsRepository.findOne(queryTemp);

    return data;
  }

  async findMarketTransaction(query: QueryTransactionDto) {
    const { page, limit } = query;
    const [data, count] = await this.transactionsRepository.findAndCount({
      where: { isMarket: true },

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const web3 = getWeb3();

    // const transactionVerified = await web3.eth.getTransaction(
    //   createTransactionDto.txHash,
    // );

    const [transactionVerified, transactionReceipt] = await Promise.all([
      web3.eth.getTransaction(createTransactionDto.txHash),
      web3.eth.getTransactionReceipt(createTransactionDto.txHash),
    ]);

    if (
      transactionVerified.to.toLowerCase() !=
        process.env.CONTRACT_LAUNCHPAD.toLowerCase() ||
      !transactionReceipt.status
    ) {
      return false;
    }

    const itemExisted = await this.transactionsRepository.findOne({
      txHash: createTransactionDto.txHash.toLowerCase(),
    });

    if (itemExisted) {
      console.log('transactionVerifiedssssssss: ');

      return false;
    }

    const item = await this.transactionsRepository.create(createTransactionDto);
    const data = await this.transactionsRepository.save(item);

    if (createTransactionDto.isMarket && createTransactionDto.tokenId) {
      await this.nftService.createMetadata(createTransactionDto.tokenId);
    }

    return data;
  }

  async getAmountByRef(refCode: string) {
    try {
      const queryTemp = { isMarket: true, refCode: refCode };

      const data = await this.transactionsRepository.find(queryTemp);

      let total = 0;

      data.forEach((item) => (total += item.amount));

      return total;
    } catch (e) {}
  }
}
