import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

import { History } from './entities/history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';

import { Abi as BridgeAbi } from '../contract/Bridge';

import { getWeb3 } from '../utils/web3';

import { PendingWithdraw } from './entities/pending-withdraw.entity';

import { QueryHistoryDto } from './dto/query-history.dto';

import Web3 from 'web3';
import { HISTORY_TYPE } from 'src/config';

interface HistoryInsert {
  amount?: number;
  account?: string;
  type?: string; // withdraw
  status?: string;
  txHash?: string;
}

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>,

    @InjectRepository(PendingWithdraw)
    private pendingRepository: Repository<PendingWithdraw>,

    private transactionServices: TransactionsService,

    private usersServices: UsersService,
  ) {}

  async checkPendingUser(account: string) {
    try {
      const e = await this.pendingRepository.findOne({
        account: account.toLowerCase(),
      });

      if (!e) {
        return false;
      }

      if (e.isPending) {
        return true;
      }

      return false;
    } catch (e) {
      console.log('insertHistory: ', e);
      return false;
    }
  }

  async signMessage(address: string) {
    const isPendingWithdraw = await this.checkPendingUser(address);

    if (isPendingWithdraw) {
      return false;
    }

    await this.setPendingUser(address);

    try {
      const totalEarn = await this.usersServices.getTotalOfUser(address);

      if (+totalEarn <= 0) {
        return false;
      }

      const web3 = getWeb3();

      const PRIVATE_KEY = process.env.KEY_ADMIN;
      const CONTRACT_BRIDGE = process.env.CONTRACT_BRIDGE;

      const contract = new web3.eth.Contract(BridgeAbi as any, CONTRACT_BRIDGE);

      const [nonce, history] = await Promise.all([
        contract.methods.nonce().call(),
        contract.methods.userInfo(address).call(),
      ]);

      const amount = totalEarn - +history.total / 1e18;

      const hash = web3.utils.keccak256(
        web3.eth.abi.encodeParameters(
          ['uint256', 'address', 'uint256'],
          [Web3.utils.toWei(`${amount}`), address.toLowerCase(), nonce],
        ),
      );

      const signature = web3.eth.accounts.sign(hash, PRIVATE_KEY);

      return {
        message: signature,
        amount,
        address,
      };
    } catch (e) {
      console.log('createHistory: ', e);
      await this.setPendingUser(address);
    }

    return false;
  }

  async setPendingUser(account: string) {
    try {
      const itemExist = await this.pendingRepository.findOne({
        account: account.toLowerCase(),
      });

      if (!itemExist) {
        const item = await this.pendingRepository.create({
          account,
          isPending: true,
        });
        const data = await this.pendingRepository.save(item);
        return data;
      }

      if (itemExist.isPending) {
        itemExist.isPending = false;
      } else {
        itemExist.isPending = true;
      }

      return await this.pendingRepository.save(itemExist);
    } catch (e) {
      console.log('setPendingUser: ', e);
      return false;
    }
  }

  async updateHistory(createHistoryDto?: CreateHistoryDto) {
    try {
      const newObj = createHistoryDto;
      let e = await this.historyRepository.findOne({
        txHash: newObj.txHash,
      });
      if (!e) {
        e = await this.historyRepository.create(createHistoryDto);
      } else {
        Object.keys(newObj).forEach((key) => {
          e[key] = newObj[key];
        });
      }

      return await this.historyRepository.save(e);
    } catch (e) {
      console.log('insertHistory: ', e);
    }
  }

  async create(createHistoryDto?: CreateHistoryDto) {
    try {
      await this.updateHistory(createHistoryDto);

      return true;
    } catch (e) {
      console.log('createHistory: ', e);
    } finally {
      const isPending = await this.checkPendingUser(createHistoryDto?.account);
      if (isPending) {
        await this.setPendingUser(createHistoryDto?.account);
      }
    }

    return false;
  }

  async findAll(query?: QueryHistoryDto) {
    const { page, limit, address, status } = query;

    const queryTemp: any = { account: address.toLowerCase() };

    if (status) {
      queryTemp.status = status;
    }
    const [data, count] = await this.historyRepository.findAndCount({
      where: queryTemp,

      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async totalWithdraw(address: string) {
    try {
      const data = await this.historyRepository.find({
        where: { account: address.toLowerCase(), status: HISTORY_TYPE.SUCCESS },
        order: { createdAt: -1 },
      });

      let total = 0;

      data.forEach((item) => (total += item.amount));

      return { total, length: data.length };
    } catch (e) {
      console.log('findByAddress: ', e);
      return null;
    }
  }
}
