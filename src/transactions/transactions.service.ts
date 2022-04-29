import { Injectable } from '@nestjs/common';
import { Transaction } from './transactions.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

import { NftService } from '../nft/nft.service';
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private readonly nftService: NftService,
  ) {}

  async findAll(query: QueryTransactionDto) {
    const { page, limit, isMarket } = query;
    const [data, count] = await this.transactionsRepository.findAndCount({
      where: { isMarket: isMarket },

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async findTransMarket(query: any) {
    const { address } = query;
    const data = await this.transactionsRepository.findOne({
      isMarket: true,
      address: address.toLowerCase(),
    });

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
    const item = await this.transactionsRepository.create(createTransactionDto);
    const data = await this.transactionsRepository.save(item);

    if (createTransactionDto.isMarket && createTransactionDto.tokenId) {
      await this.nftService.createMetadata(createTransactionDto.tokenId);
    }

    return data;
  }
}
