import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getWeb3 } from 'src/utils/web3';
import { CreateDaoElementTransactionDto } from './dto/create-dao-element-transaction.dto';
import { UpdateDaoElementTransactionDto } from './dto/update-dao-element-transaction.dto';
import { Abi as launchpadNFTAbi } from '../contract/LaunchPadNFT';
import { Abi as marketAbi } from '../contract/Market';
import { Abi as priceGetterABI } from '../contract/PriceGetter';
import axios from 'axios';
import abiDecoder from 'abi-decoder';
import Promise from 'bluebird';
import config from '../config/index';
import {
  DaoElementTransaction,
  ElementType,
  UnitToken,
} from './entities/dao-element-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BigNumber from 'bignumber.js';
import { Console } from 'console';
import { getMonthTimeRange } from 'src/utils/helper';

@Injectable()
export class DaoElementTransactionService {
  constructor(
    @InjectRepository(DaoElementTransaction)
    private daoElementTransactionReposity: Repository<DaoElementTransaction>
  ) {}

  create(createDaoElementTransactionDto: CreateDaoElementTransactionDto) {
    return 'This action adds a new daoElementTransaction';
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async getDAOElementTransactionJob() {
    try {
      console.log('Start DAO element transaction job ');
      // await this.getLaunchpadTransaction();
      await this.getMarketTransaction();
      await this.getRouterTransaction();
      console.log('End DAO element transaction job ');
    } catch (error) {
      console.log(error?.response?.error);
      throw error;
    }
  }

  async getLaunchpadTransaction() {
    try {
      console.log('LAUNCHPAD JOB !');
      const decimal = 10 ** 18;
      const web3 = getWeb3();
      const latestLaunchpadTransaction =
        await this.daoElementTransactionReposity.find({
          where: { type: ElementType.LAUNCHPAD },
          order: { block_number: 'DESC' },
        });
      const allTransaction = await axios.get(process.env.DOMAIN_BSC, {
        params: {
          address: process.env.LAUNCHPAD_CONTRACT,
          apikey: process.env.BSC_API_KEY,
          action: 'txlist',
          module: 'account',
          sort: 'desc',
          startblock: latestLaunchpadTransaction[0]?.block_number || 0,
        },
      });

      const transactions = allTransaction?.data?.result;
      if (!transactions || !transactions.length) {
        return;
      }

      latestLaunchpadTransaction.length && transactions.pop();

      const corkPrice = await this.corkPriceToBUSD();

      const result = await Promise.map(transactions, async (transaction) => {
        if (transaction.isError !== '0') {
          return;
        }
        const txReceipt = await web3.eth.getTransactionReceipt(
          transaction.hash
        );

        if (!txReceipt) return;
        const value = await this.getValueFromTxReceipt(txReceipt, 'uint256');
        const corkValue = new BigNumber(value.toString())
          .div(new BigNumber(corkPrice))
          .toString();

        const insertData = {
          txhash: transaction.hash,
          type: ElementType.LAUNCHPAD,
          block_number: transaction.blockNumber,
          timestamp: +transaction.timeStamp,
          from_address: transaction.from,
          to_address: transaction.to,
          unit_token_name: UnitToken.BUSD,
          unit_token_address: '0x98649fde88981790b574c9A6066004D5170Bf3EF',
          value: +value / decimal,
          corkValue: +corkValue,
        };

        await this.daoElementTransactionReposity.insert(insertData);
      });
      console.log('DONE LAUNCHPAD JOB !');
    } catch (error) {
      console.log(error?.response?.error);
      throw error;
    }
  }

  async getMarketTransaction() {
    console.log('START MARKET JOB !');

    try {
      const web3 = getWeb3();
      const marketContractAddress = process.env.MARKET_CONTRACT;
      const busdAddress = process.env.BUSD_TOKEN.toLowerCase();
      const marketContract = new web3.eth.Contract(
        marketAbi as any,
        marketContractAddress
      );
      const latestMarketTransaction =
        await this.daoElementTransactionReposity.find({
          where: { type: ElementType.MARKET },
          order: { block_number: 'DESC' },
        });

      const allTransactions = await axios.get(process.env.DOMAIN_BSC, {
        params: {
          address: marketContractAddress,
          apikey: process.env.BSC_API_KEY,
          action: 'txlist',
          module: 'account',
          sort: 'desc',
          startblock: latestMarketTransaction[0]?.block_number || 0,
        },
      });

      abiDecoder.addABI(marketAbi);

      const marketTransactions = allTransactions.data.result.filter(
        (transaction) => {
          const data = abiDecoder.decodeMethod(transaction.input);
          if (data?.name === 'accept') return transaction;
        }
      );

      latestMarketTransaction.length && marketTransactions.shift();

      const result = await Promise.map(
        marketTransactions,
        async (transaction) => {
          const txReceipt = await web3.eth.getTransactionReceipt(
            transaction?.hash
          );

          const values = await this.getTotalValueFromTxReceipt(txReceipt);

          const insertData = {
            txhash: transaction.hash,
            type: ElementType.MARKET,
            block_number: transaction.blockNumber,
            timestamp: +transaction.timeStamp,
            from_address: transaction.from,
            to_address: transaction.to,
          };

          const corkPrice = await this.corkPriceToBUSD();
          await Promise.map(values, async (value) => {
            let corkValue = value.total;

            if (value.unit_token_address.toLowerCase() === busdAddress) {
              corkValue = await this.tokenPriceInCork(
                web3.utils.toWei(value.total + ''),
                corkPrice
              );
            }
            await this.daoElementTransactionReposity.insert({
              ...insertData,
              value: value.total,
              unit_token_address: value.unit_token_address,
              unit_token_name: value.unit_token_name,
              corkValue: +corkValue,
            });
          });
        }
      );

      console.log('DONE MARKET JOB !');
    } catch (error) {
      console.log(error?.response?.error);
      throw error;
    }
  }

  async getRouterTransaction() {
    console.log('START ROUTER JOB !');

    try {
      const web3 = getWeb3();
      const bnbBusd = process.env.BNB_BUSD.toLowerCase();
      const adoBnb = process.env.CORK_BNB.toLowerCase();
      const adoBusd = process.env.CORK_BUSD.toLowerCase();
      const latestRouterTransaction =
        await this.daoElementTransactionReposity.find({
          where: { type: ElementType.ROUTER },
          order: { block_number: 'DESC' },
        });
      const allTransactions = await axios.get(process.env.DOMAIN_BSC, {
        params: {
          address: process.env.ROUTER_CONTRACT,
          apikey: process.env.BSC_API_KEY,
          action: 'txlist',
          module: 'account',
          sort: 'desc',
          startblock: latestRouterTransaction[0]?.block_number || 0,
        },
      });

      const transactions = allTransactions?.data?.result;
      if (!transactions || !transactions.length) {
        return;
      }

      latestRouterTransaction.length && transactions.pop();

      const result = await Promise.map(
        transactions,
        async (transaction, index) => {
          const txReceipt = await web3.eth.getTransactionReceipt(
            transaction.hash
          );

          if (!txReceipt) return;
          const values = await this.getValueFromRouterTxReceipt(txReceipt);
          const insertData = {
            txhash: transaction.hash,
            type: ElementType.ROUTER,
            block_number: transaction.blockNumber,
            timestamp: +transaction.timeStamp,
            from_address: transaction.from,
            to_address: transaction.to,
          };

          await Promise.map(values, async (value) => {
            let corkValue = 0;

            if (value.unit_token_address.toLowerCase() === adoBnb)
              corkValue = await this.getLpPriceInCork(adoBnb);

            if (value.unit_token_address.toLowerCase() === bnbBusd)
              corkValue = await this.getLpPriceInCork(bnbBusd);

            if (value.unit_token_address.toLowerCase() === adoBusd)
              corkValue = await this.getLpPriceInCork(adoBusd);

            await this.daoElementTransactionReposity.insert({
              ...insertData,
              value: value.total,
              unit_token_address: value.unit_token_address,
              unit_token_name: value.unit_token_name,
              corkValue: +corkValue,
            });
          });
        }
      );

      console.log('DONE ROUTER JOB !');
    } catch (error) {
      console.log(error?.response?.error);
      throw error;
    }
  }

  async getValueFromTxReceipt(transaction, type) {
    const web3 = getWeb3();
    const value = transaction?.logs[0]?.data;
    if (!value) {
      return;
    }
    const result = await web3.eth.abi.decodeParameter(type, value);

    return result;
  }

  async getTotalValueFromTxReceipt(transaction) {
    try {
      const decimal = 10 ** 18;
      const ownerAddress = process.env.OWNER_ADDRESS;
      const transferTransaction = process.env.TRANSFER_TRANSACTION;
      const busdAddress = process.env.BUSD_TOKEN;
      const corkAddress = process.env.CORK_TOKEN;
      const web3 = getWeb3();
      const result = [];
      await Promise.map(transaction.logs, async (log) => {
        let totalValue = 0;
        if (log.address !== busdAddress && log.address !== corkAddress) {
          return;
        }
        const topics = log.topics;

        const parsedTopics = await this.parseLogTopic(topics);

        if (
          parsedTopics.indexOf(ownerAddress.toLowerCase()) !== '-1' &&
          topics.indexOf(transferTransaction) !== -1
        ) {
          let decodeData;
          try {
            decodeData = await web3.eth.abi.decodeParameter(
              'uint256',
              log.data
            );
          } catch (error) {
            return;
          }
          totalValue += +decodeData / decimal;

          if (log) {
            result.push({
              total: totalValue,
              unit_token_address: log.address,
              unit_token_name:
                log.address === busdAddress ? UnitToken.BUSD : UnitToken.CORK,
            });
          }
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getValueFromRouterTxReceipt(transaction) {
    try {
      const decimal = 10 ** 18;
      const ownerAddress = process.env.OWNER_ADDRESS.toLowerCase();
      const bnbBusd = process.env.BNB_BUSD.toLowerCase();
      const adoBnb = process.env.CORK_BNB.toLowerCase();
      const adoBusd = process.env.CORK_BUSD.toLowerCase();
      const web3 = getWeb3();
      const result = [];
      await Promise.map(transaction.logs, async (log) => {
        let totalValue = 0;
        if (
          log.address.toLowerCase() !== bnbBusd &&
          log.address.toLowerCase() !== adoBnb &&
          log.address.toLowerCase() !== adoBusd
        ) {
          return;
        }

        const topics = log.topics;
        const parsedTopics = await this.parseLogTopic(topics);

        if (
          parsedTopics[1]?.toLowerCase() ===
            process.env.ZERO_ADDRESS.toLowerCase() &&
          parsedTopics[2]?.toLowerCase() === ownerAddress
        ) {
          let decodeData;
          try {
            decodeData = await web3.eth.abi.decodeParameter(
              'uint256',
              log.data
            );
          } catch (error) {
            return;
          }
          totalValue += +decodeData / decimal;

          if (log) {
            const insertData = {
              total: totalValue,
              unit_token_address: log.address,
              unit_token_name: '',
            };

            if (log.address.toLowerCase() === bnbBusd) {
              insertData.unit_token_name = UnitToken.BNB_BUSD;
            }
            if (log.address.toLowerCase() === adoBnb) {
              insertData.unit_token_name = UnitToken.CORK_BNB;
            }
            if (log.address.toLowerCase() === adoBusd) {
              insertData.unit_token_name = UnitToken.CORK_BUSD;
            }
            result.push(insertData);
          }
        }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async parseLogTopic(topics) {
    const web3 = getWeb3();
    const result = await Promise.map(topics, async (topic) => {
      try {
        const decodeAddress = await web3.eth.abi.decodeParameter(
          'address',
          topic
        );
        return decodeAddress.toString();
      } catch (error) {
        return;
      }
    });
    return result;
  }

  async getMonthTransactions(type: ElementType, month: number) {
    const { start, end, daysInMonth } = getMonthTimeRange(month);

    const monthTransactions = await this.daoElementTransactionReposity.find({
      where: {
        type,
        timestamp: { $gt: start, $lt: end },
      },
      order: { timestamp: 'ASC' },
    });

    let startOfDay: number;
    const transactionPerDay = [...Array(daysInMonth).keys()].map((i) => {
      startOfDay = start + 86400 * i;
      const endOfDay = startOfDay + 86399;

      const dayTransaction = monthTransactions
        .filter((transaction) => {
          return (
            transaction.timestamp >= startOfDay &&
            transaction.timestamp <= endOfDay
          );
        })
        .reduce((totalCork, tx) => (totalCork += tx.corkValue), 0);

      return { time: startOfDay * 1000, value: dayTransaction };
    });
    return transactionPerDay;
  }

  async getTokenPriceInUSD(
    tokenAddress: string,
    decimal = 18
  ): Promise<string | undefined> {
    const web3 = getWeb3();

    const priceGetterContract = new web3.eth.Contract(
      priceGetterABI as any,
      process.env.CONTRACT_PRICE_GETTER
    );

    if (!web3.utils.isAddress(tokenAddress)) return null;

    const tokenPrices = await priceGetterContract.methods
      .getLPPrice(tokenAddress, decimal)
      .call();

    return tokenPrices;
  }

  async corkPriceToBUSD(): Promise<string> {
    const corkPrice = await this.getTokenPriceInUSD(process.env.CORK_TOKEN);

    return corkPrice;
  }

  async tokenPriceInCork(
    valueInWei: string,
    corkPrice: string
  ): Promise<string> {
    const busdValueInCork = new BigNumber(valueInWei)
      .div(new BigNumber(corkPrice))
      .toString();
    return busdValueInCork;
  }

  async getLpPriceInCork(address: string): Promise<string> {
    const lpPriceInBUSD = await this.getTokenPriceInUSD(address);
    const corkPrice = await this.corkPriceToBUSD();
    return await this.tokenPriceInCork(lpPriceInBUSD, corkPrice);
  }
}
