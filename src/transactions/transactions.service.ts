import { Injectable } from '@nestjs/common';
import { Transaction } from './transactions.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

import { NftService } from '../nft/nft.service';
import { ConfigurationService } from '../configuration/configuration.service';

import { getWeb3 } from '../utils/web3';

import { Cron, CronExpression } from '@nestjs/schedule';

import { getTime, CONFIG, GET_AMOUNT_LAUNCHPAD } from '../config';

import { Abi as LaunchPadABI } from '../contract/LaunchPad';
import { MultiSendAbi } from '../contract/MultiSend';
import axios from 'axios';
import { Abi as NFTAbi } from '../contract/NFT';
import { getMonthTimeRange } from '../utils/helper';
import { UtilitiesService } from '../utils/sleep-service';
import { getCurrentTime } from 'src/utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const abiDecoder = require('abi-decoder');

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
    private readonly configService: ConfigurationService
  ) {}

  async getAll() {
    try {
      const res = await this.transactionsRepository.find();
      return res;
    } catch (error) {
      return error;
    }
  }

  async getByStaked(isStaked) {
    try {
      const res = await this.transactionsRepository.find({ isStaked });
      return res;
    } catch (error) {
      return error;
    }
  }

  async getOne(address: string) {
    const transaction = await this.transactionsRepository.findOne({ address });
    return transaction;
  }

  async updateTransaction(address: string, data) {
    const transaction = await this.getOne(address);

    await this.transactionsRepository.update(
      { address },
      {
        ...transaction,
        isStaked: false,
      }
    );
  }

  async findAll(query: QueryTransactionDto) {
    const { page, limit, refCode, address } = query;

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

  async findAllFilter(query) {
    const transaction = await this.transactionsRepository.find(query);

    return transaction;
  }

  async findOne(query) {
    const transaction = await this.transactionsRepository.findOne(query);

    return transaction;
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      if (this?.['IS_IN_JOB_CREATE_PATIENT']) {
        let i = 0;
        while (i < 50) {
          if (!this?.['IS_IN_JOB_CREATE_PATIENT']) {
            break;
          }
          console.log(
            `\n\n====SKIPPP THIS ROUND at ${new Date().getTime()}===\n\n`
          );
          await UtilitiesService.prototype.sleep(200);
          i++;
        }
      }
      this['IS_IN_JOB_CREATE_PATIENT'] = true;
      const web3 = getWeb3();

      // const [transactionVerified, transactionReceipt] = await Promise.all([
      //   web3.eth.getTransaction(createTransactionDto.txHash),
      //   web3.eth.getTransactionReceipt(createTransactionDto.txHash),
      // ]);

      // if (
      //   transactionVerified.to.toLowerCase() !=
      //     process.env.CONTRACT_LAUNCHPAD.toLowerCase() ||
      //   !transactionReceipt.status
      // ) {
      //   return false;
      // }

      // const itemExisted = await this.transactionsRepository.findOne({
      //   txHash: createTransactionDto.txHash.toLowerCase(),
      // });

      // if (itemExisted) {
      //   return false;
      // }

      const item = this.transactionsRepository.create(createTransactionDto);
      const data = await this.transactionsRepository.save(item);

      if (createTransactionDto.isMarket && createTransactionDto.tokenId) {
        await this.nftService.createMetadata(createTransactionDto.tokenId);
      }

      return data;
    } catch (error) {
      console.log('Create transaction error : ', error);
    } finally {
      this['IS_IN_JOB_CREATE_PATIENT'] = false;
    }
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    if (this?.['IS_IN_CRONJOB']) {
      console.log(`\n\n====SKIPPP THIS ROUND at ${getTime(new Date())}===\n\n`);
      return;
    }
    this['IS_IN_CRONJOB'] = true;

    try {
      console.log(`\n\n====START THIS ROUND at ${getTime(new Date())}===\n\n`);
      await this.fetchTrans();
      await this.fetchStakingTime();
    } catch (e) {
      console.log('cronTransaction failed: ', e);
    } finally {
      console.log('\n\n====END THIS ROUND===\n\n');
      this['IS_IN_CRONJOB'] = false;
    }
  }

  async transactionJob(startBlock, endBlock, name = 'Buy') {
    const web3 = getWeb3();
    abiDecoder.addABI(MultiSendAbi);

    const contract = new web3.eth.Contract(
      LaunchPadABI as any,
      process.env.CONTRACT_LAUNCHPAD
    );

    const nftContract = new web3.eth.Contract(
      NFTAbi as any,
      process.env.CONTRACT_NFT
    );

    const data = await contract.getPastEvents(name || 'Receive', {
      fromBlock: startBlock,
      toBlock: endBlock,
    });

    const newData = [];

    for (const item of data) {
      const token = await nftContract.methods
        .getToken(item.returnValues.nftId)
        .call();

      newData.push({ ...item, address: token.tokenOwner });
    }

    const fixData = newData.map((item) => ({
      address: item.address.toLowerCase(),
      tokenId: +item.returnValues.nftId,
      from: '0x1b6DdDC77bde1B2D948dC23CF8a8fa9ad0Cd9f32',
      txHash: item.transactionHash.toLowerCase(),
      level: +item.returnValues.launchIndex + 1,
      launchpadId: +item.returnValues.launchIndex,
      isOwnerCreated: name != 'Buy',
    }));

    return fixData;
  }

  async fetchStakingTime() {
    const lastBlock = await this.configService.findOne('last_stake_block');

    const stakeNFTTransactions = await axios.get(process.env.DOMAIN_BSC, {
      params: {
        address: process.env.CONTRACT_STAKING_NFT,
        apikey: process.env.BSC_API_KEY,
        action: 'txlist',
        module: 'account',
        sort: 'desc',
        startblock: lastBlock?.value || 0,
      },
    });

    // Filter stake transactions
    const stakeFunctionFilter = stakeNFTTransactions.data.result.filter(
      (transaction) =>
        transaction.functionName.includes('stake') && transaction.isError == 0
    );

    // Arr for update user stake timestamp with Promise.all

    for (let i = 0; i < stakeFunctionFilter.length; i++) {
      const transaction = stakeFunctionFilter[i];

      await this.transactionsRepository.update(
        { address: transaction.from.toLowerCase() },
        { timestamp: transaction.timeStamp * 1000, isStaked: true }
      );
    }

    // Update last block
    if (!lastBlock?.value) {
      await this.configService.create({
        name: 'last_stake_block',
        value: stakeNFTTransactions.data.result[0].blockNumber,
        key: process.env.KEY_INIT,
      });
    }

    if (lastBlock?.value && stakeNFTTransactions.data.result.length > 0) {
      await this.configService.update(
        'last_stake_block',
        +stakeNFTTransactions.data.result[0].blockNumber + 1 + ''
      );
    }

    return stakeFunctionFilter;
  }

  async fetchTrans() {
    const lastBlock = await this.configService.findOne(CONFIG.LAST_BLOCK);
    const web3 = getWeb3();

    let finalData = [];

    const newBlock = await web3.eth.getBlockNumber();
    const startBlock = +lastBlock?.value || 17649507; //lastBlock;

    const round = Math.ceil((newBlock - startBlock) / 5000);

    try {
      for (let i = 0; i < round; i++) {
        const start = startBlock + 5000 * i;
        const end = i == round - 1 ? newBlock : startBlock + 5000 * (i + 1);

        const dataReceive = await this.transactionJob(start, end, 'Receive');
        const dataBuy = await this.transactionJob(start, end);

        finalData = [...finalData, ...dataReceive, ...dataBuy];
      }

      for (const item of finalData) {
        await this.createTransaction(item);
      }

      return { length: finalData.length, finalData };
    } catch (e) {
      console.log(e);
      return e;
    }

    // const lastBlock = await this.configService.findOne(CONFIG.LAST_BLOCK);

    // const response = await axios.get(process.env.DOMAIN_BSC, {
    //   params: {
    //     address: process.env.CONTRACT_LAUNCHPAD,
    //     apikey: process.env.BSC_API_KEY,
    //     action: 'txlist',
    //     module: 'account',
    //     sort: 'desc',
    //     startblock: +lastBlock?.value,
    //     // endblock: +lastBlock + 9999,
    //   },
    // });

    // abiDecoder.addABI(LaunchPadABI);

    // const arr = [];

    // for (const item of response.data?.result) {
    //   const data = abiDecoder.decodeMethod(item.input);

    //   const newData: any = {
    //     block: item.blockNumber,
    //     txHash: item.hash,
    //     timestamp: +item.timeStamp * 1000,
    //     from: item.from.toLowerCase(),
    //   };

    //   // if (item.txreceipt_status == 1) {
    //   //   if (data?.name == 'sentNFT') {
    //   //     const { returnValues } = await this.fetchEvent(
    //   //       'Receive',
    //   //       item.blockNumber
    //   //     );

    //   //     newData.address = data.params
    //   //       .find((item) => item.name == '_receiver')
    //   //       .value.toLowerCase();
    //   //     newData.launchpadId = +returnValues.launchIndex;
    //   //     newData.tokenId = +returnValues.nftId;
    //   //     newData.isOwnerCreated = true;
    //   //     newData.refCode = returnValues.refCode;
    //   //     newData.amount = +GET_AMOUNT_LAUNCHPAD[returnValues.launchIndex];
    //   //     newData.level = +returnValues.launchIndex + 1;
    //   //     newData.type = 'market';
    //   //     newData.isMarket = true;

    //   //     arr.push(newData);
    //   //   } else if (data?.name == 'buyNFT') {
    //   //     const { returnValues } = await this.fetchEvent(
    //   //       'Buy',
    //   //       item.blockNumber
    //   //     );
    //   //     newData.address = returnValues.user.toLowerCase();
    //   //     newData.launchpadId = +returnValues.launchIndex;
    //   //     newData.tokenId = +returnValues.nftId;
    //   //     newData.refCode = returnValues.refCode;
    //   //     newData.amount = +GET_AMOUNT_LAUNCHPAD[returnValues.launchIndex];
    //   //     newData.level = +returnValues.launchIndex + 1;
    //   //     newData.type = 'market';
    //   //     newData.isOwnerCreated = false;
    //   //     newData.isMarket = true;

    //   //     arr.push(newData);
    //   //   }
    //   // }
    // }

    // const promises = [];

    // for (const item of arr) {
    //   await this.createTransaction(item);
    // }

    // await Promise.all(promises);

    // if (response.data?.result?.length) {
    //   await this.configService.update(
    //     CONFIG.LAST_BLOCK,
    //     `${response.data?.result[0].blockNumber}`
    //   );
    // }
  }

  async fetchEvent(name: string, blockNumber: string) {
    const web3 = getWeb3();

    const contract = new web3.eth.Contract(
      LaunchPadABI as any,
      process.env.CONTRACT_LAUNCHPAD
    );

    const data = await contract.getPastEvents(name || 'Receive', {
      fromBlock: blockNumber,
      toBlock: blockNumber,
    });

    return data[0];
  }

  async getMonthTransactions(month: number) {
    const { start, end, daysInMonth } = getMonthTimeRange(month);
    const monthTransactions = await this.transactionsRepository.find({
      where: {
        timestamp: { $lt: end * 1000 },
      },
      order: { timestamp: 'ASC' },
    });

    let startOfDay: number;

    const currentTime = getCurrentTime();

    const transactionPerDay = [...Array(daysInMonth).keys()]
      .map((i) => {
        startOfDay = start + 86400 * i;
        const endOfDay = startOfDay + 86399;

        const dayTransaction = monthTransactions.filter(
          (transaction) =>
            transaction.timestamp / 1000 <= endOfDay && transaction.isStaked
        );

        return { time: startOfDay * 1000, value: dayTransaction.length };
      })
      .filter((dayValue) => dayValue.time < currentTime);
    return transactionPerDay;
  }

  async getUserStaked(address: string): Promise<boolean> {
    const web3 = getWeb3();
    if (!web3.utils.isAddress(address)) return false;

    const NFTContract = new web3.eth.Contract(
      NFTAbi as any,
      process.env.CONTRACT_NFT
    );

    const user = await this.getOne(address);

    if (!user) return false;
    if (!user?.isStaked) {
      const { stakeFreeze } = await NFTContract.methods
        .getInfoForStaking(user.tokenId)
        .call();

      this.transactionsRepository.update(
        { address },
        { isStaked: stakeFreeze }
      );

      return stakeFreeze;
    }
    return true;
  }
}
