import { Injectable } from '@nestjs/common';
import { IDOTransaction, TransactionMethod } from './ido-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateIDOTransactionDto } from './dto/create-ido-transaction.dto';
import { QueryIDOTransactionDto } from './dto/query-ido-transaction.dto';

import { idoNFTService } from '../ido-nft/ido-nft.service';
import { ConfigurationService } from '../configuration/configuration.service';

import { getWeb3 } from '../utils/web3';

import { Cron, CronExpression, Timeout } from '@nestjs/schedule';

import {
  getTime,
  CONFIG,
  GET_AMOUNT_LAUNCHPAD,
  GET_IDO_AMOUNT_LAUNCHPAD,
} from '../config';

import { Abi as IDOLaunchPadABI } from '../contract/IDO-LaunchPad';
import axios from 'axios';
import { Abi as IDONFTAbi } from '../contract/IDO-NFT';
import { getMonthTimeRange } from '../utils/helper';
import { UtilitiesService } from 'src/utils/sleep-service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const abiDecoder = require('abi-decoder');

interface QueryTransMarket {
  isMarket?: boolean;
  address?: string;
  refCode?: string;
}
@Injectable()
export class IDOTransactionsService {
  constructor(
    @InjectRepository(IDOTransaction)
    private idoTransactionsRepository: Repository<IDOTransaction>,
    private readonly idoNFTService: idoNFTService,
    private readonly configService: ConfigurationService
  ) {}

  async getAll() {
    try {
      const res = await this.idoTransactionsRepository.find();
      return res;
    } catch (error) {
      return error;
    }
  }
  async findByTokenId(id: string) {
    try {
      const res = await this.idoTransactionsRepository.findOne({
        where: { tokenId: id },
      });
      return res;
    } catch (error) {
      return error;
    }
  }

  async getByStaked(isStaked) {
    try {
      const res = await this.idoTransactionsRepository.find({});
      return res;
    } catch (error) {
      return error;
    }
  }

  async getOne(address: string) {
    const transaction = await this.idoTransactionsRepository.findOne({
      address,
    });
    return transaction;
  }

  async updateTransaction(address: string, data) {
    const transaction = await this.getOne(address);

    await this.idoTransactionsRepository.update(
      { address },
      {
        ...transaction,
        isStaked: false,
      }
    );
  }

  async findAll(query: QueryIDOTransactionDto) {
    const { page, limit, refCode, address } = query;

    const queryTemp: QueryTransMarket = {};

    if (address) {
      queryTemp.address = address.toLowerCase();
    }

    if (refCode) {
      queryTemp.refCode = refCode;
    }

    const [data, count] = await this.idoTransactionsRepository.findAndCount({
      where: queryTemp,

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async findTransMarket(query: QueryTransMarket) {
    const { address, refCode } = query;

    const queryTemp: QueryTransMarket = {};

    if (address) {
      queryTemp.address = address.toLowerCase();
    }

    if (refCode) {
      queryTemp.refCode = refCode;
    }

    const data = await this.idoTransactionsRepository.findOne(queryTemp);

    return data;
  }

  async findMarketTransaction(query: QueryIDOTransactionDto) {
    const { page, limit } = query;
    const [data, count] = await this.idoTransactionsRepository.findAndCount({
      where: {},

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async createTransaction(createTransactionDto: CreateIDOTransactionDto) {
    try {
      const web3 = getWeb3();

      abiDecoder.addABI(IDOLaunchPadABI);
      const [transactionVerified, transactionReceipt] = await Promise.all([
        web3.eth.getTransaction(createTransactionDto.txHash),
        web3.eth.getTransactionReceipt(createTransactionDto.txHash),
      ]);

      const realLaunchPadId = abiDecoder.decodeMethod(
        transactionVerified.input
      );
      const action = realLaunchPadId?.name;
      const [realAmount, realTokenId] = await Promise.all([
        action === 'buyNFT'
          ? +(await web3.eth.abi.decodeParameter(
              'uint256',
              transactionReceipt.logs[0].data
            ))
          : 0,
        +(await web3.eth.abi.decodeParameter(
          'uint256',
          action === 'buyNFT'
            ? transactionReceipt.logs[4].data
            : transactionReceipt.logs[2].data
        )),
      ]);
      if (
        realLaunchPadId?.name !== 'buyNFT' &&
        realLaunchPadId?.name !== 'sentNFT'
      ) {
        return false;
      }

      createTransactionDto.amount = realAmount / 1e18;
      createTransactionDto.launchpadId = +realLaunchPadId?.params[0]?.value;
      createTransactionDto.tokenId = +realTokenId;
      createTransactionDto.method =
        realLaunchPadId?.name === 'buyNFT'
          ? TransactionMethod.BUY_NFT
          : TransactionMethod.SEND_NFT;

      if (
        transactionVerified.to.toLowerCase() !=
          process.env.CONTRACT_IDO_LAUNCHPAD.toLowerCase() ||
        !transactionReceipt.status
      ) {
        return false;
      }

      const itemExisted = await this.idoTransactionsRepository.findOne({
        txHash: createTransactionDto.txHash.toLowerCase(),
      });

      if (itemExisted) {
        return false;
      }

      const item = await this.idoTransactionsRepository.create(
        createTransactionDto
      );
      const data = await this.idoTransactionsRepository.save(item);
      if (createTransactionDto.tokenId) {
        await this.idoNFTService.createMetadata(
          createTransactionDto.tokenId,
          createTransactionDto.launchpadId
        );
      }

      return data;
    } catch (error) {
      console.log('Create transaction err : ', error);
    }
  }

  async getAmountByRef(refCode: string) {
    try {
      const queryTemp = { refCode: refCode };

      const data = await this.idoTransactionsRepository.find(queryTemp);

      let total = 0;

      data.forEach((item) => (total += item.amount));

      return total;
    } catch (e) {}
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async fetchTrans() {
    console.log(
      `\n\n====START THIS ROUND (IDO) at ${getTime(new Date())}===\n\n`
    );

    try {
      const lastIdoBlock = await this.configService.findOne(
        CONFIG.LAST_IDO_BLOCK
      );

      const response = await axios.get(process.env.DOMAIN_BSC, {
        params: {
          address: process.env.CONTRACT_IDO_LAUNCHPAD,
          apikey: process.env.BSC_API_KEY,
          action: 'txlist',
          module: 'account',
          sort: 'desc',
          startblock: +lastIdoBlock.value,
        },
      });

      abiDecoder.addABI(IDOLaunchPadABI);

      const arr = [];

      for (const item of response.data?.result) {
        const data = abiDecoder.decodeMethod(item.input);

        const newData: any = {
          block: item.blockNumber,
          txHash: item.hash,
          timestamp: +item.timeStamp * 1000,
          from: item.from.toLowerCase(),
        };

        if (item.txreceipt_status == 1) {
          if (data?.name == 'sentNFT') {
            const { returnValues } = await this.fetchEvent(
              'Receive',
              item.blockNumber
            );

            newData.address = data.params
              .find((item) => item.name == '_receiver')
              .value.toLowerCase();
            newData.launchpadId = +returnValues.launchIndex;
            newData.tokenId = +returnValues.nftId;
            newData.isOwnerCreated = true;
            newData.refCode = returnValues.refCode;
            newData.amount =
              +GET_IDO_AMOUNT_LAUNCHPAD[returnValues.launchIndex];
            newData.level = 1;
            newData.type = 'ido-market';
            newData.isMarket = false;

            arr.push(newData);
          } else if (data?.name == 'buyNFT') {
            const { returnValues } = await this.fetchEvent(
              'Buy',
              item.blockNumber
            );
            newData.address = returnValues.user.toLowerCase();
            newData.launchpadId = +returnValues.launchIndex;
            newData.tokenId = +returnValues.nftId;
            newData.refCode = returnValues.refCode;
            newData.amount =
              +GET_IDO_AMOUNT_LAUNCHPAD[returnValues.launchIndex];
            newData.level = 1;
            newData.type = 'ido-market';
            newData.isOwnerCreated = false;
            newData.isMarket = false;

            arr.push(newData);
          }
        }
      }

      // const promises = [];

      for (const item of arr) {
        await this.createTransaction(item);
      }

      // await Promise.all(promises);

      if (response.data?.result?.length) {
        await this.configService.update(
          CONFIG.LAST_IDO_BLOCK,
          `${response.data?.result[0].blockNumber}`
        );
      }
    } catch (error) {
      console.log('ido laucnhpad error:', error);
    }

    console.log('\n\n====END THIS ROUND (IDO)===\n\n');
  }

  async fetchEvent(name: string, blockNumber: string) {
    const web3 = getWeb3();

    const contract = new web3.eth.Contract(
      IDOLaunchPadABI as any,
      process.env.CONTRACT_IDO_LAUNCHPAD
    );

    const data = await contract.getPastEvents(name || 'Receive', {
      fromBlock: blockNumber,
      toBlock: blockNumber,
    });

    return data[0];
  }

  async getMonthTransactions(month: number) {
    const { start, end, daysInMonth } = getMonthTimeRange(month);
    const monthTransactions = await this.idoTransactionsRepository.find({
      where: {
        timestamp: { $gt: start * 1000, $lt: end * 1000 },
      },
      order: { timestamp: 'ASC' },
    });

    let startOfDay: number;
    const transactionPerDay = [...Array(daysInMonth).keys()].map((i) => {
      startOfDay = start + 86400 * i;
      const endOfDay = startOfDay + 86399;

      const dayTransaction = monthTransactions.filter((transaction) => {
        return (
          transaction.timestamp / 1000 >= startOfDay &&
          transaction.timestamp / 1000 <= endOfDay
        );
      });

      return { time: startOfDay * 1000, value: dayTransaction.length };
    });
    return transactionPerDay;
  }

  async getUserStaked(address: string): Promise<boolean> {
    const web3 = getWeb3();
    if (!web3.utils.isAddress(address)) return false;

    const NFTContract = new web3.eth.Contract(
      IDONFTAbi as any,
      process.env.CONTRACT_IDO_NFT
    );

    const user = await this.getOne(address);

    if (!user) return false;
    if (!user?.isStaked) {
      const { stakeFreeze } = await NFTContract.methods
        .getInfoForStaking(user.tokenId)
        .call();

      this.idoTransactionsRepository.update(
        { address },
        { isStaked: stakeFreeze }
      );

      return stakeFreeze;
    }
    return true;
  }
}
