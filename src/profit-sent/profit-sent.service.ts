import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';
import {
  AUTO_PROFIT_TYPE,
  REWARD_KEY_PERCENT_TYPE,
  REWARD_KEY_TYPE,
} from 'src/profit/profit.service';
import { Transaction } from 'src/transactions/transactions.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { getDateInterval } from 'src/utils/helper';
import { Repository } from 'typeorm';
import { CreateProfitSentDto } from './dto/create-profit-sent.dto';
import { ProfitSent } from './entities/profit-sent.entity';

@Injectable()
export class ProfitSentService {
  constructor(
    @InjectRepository(ProfitSent)
    private profitSentRepo: Repository<ProfitSent>,
    private readonly transactionService: TransactionsService
  ) {}
  async create(createProfitSentDto: CreateProfitSentDto) {
    const profitSentItem = this.profitSentRepo.create(createProfitSentDto);
    const saveProfit = await this.profitSentRepo.save(profitSentItem);
    return saveProfit;
  }

  async findLastReward() {
    const [lastReward] = await this.profitSentRepo.find({
      order: { dateSendReward: 'DESC' },
    });
    return lastReward;
  }

  async findUserLastReward(userStakedTime: number) {
    const rewards = await this.profitSentRepo.find({
      where: {
        daoUntilTime: { $gte: userStakedTime },
      },
      order: { dateSendReward: 'DESC' },
    });

    return rewards;
  }

  async findUserProfitSent(type: PROFIT_TYPE, address: string) {
    const user = await this.transactionService.findOne({ address });

    if (!user) return [];

    const userProfitSent = await this.findUserLastReward(user.timestamp);

    let userProfitHistory = [];

    for (let i = 0; i < userProfitSent.length; i++) {
      const profit = userProfitSent[i];

      const daoTierPercent =
        await this.transactionService.findDaoPercentPerTier(
          profit.daoUntilTime
        );

      const daoPercent =
        AUTO_PROFIT_TYPE[type] ?? profit[REWARD_KEY_PERCENT_TYPE[type]];

      const userTierPercent = daoTierPercent[user.level];

      const data = {
        daoProfitPercent: userTierPercent,
        amountProfit:
          profit[REWARD_KEY_TYPE[type]] * (daoPercent / 100) * userTierPercent,
        dexProfit: profit[REWARD_KEY_TYPE[type]],
        daoDividends: profit[REWARD_KEY_TYPE[type]] * (daoPercent / 100),
        totalDaoUser: profit.totalDaoUser,
        dateReward: profit.dateSendReward,
      };

      userProfitHistory = [...userProfitHistory, data];
    }

    return userProfitHistory;
  }

  async findTodayProfitWithType(type: PROFIT_TYPE, user: Transaction) {
    const { start, end } = getDateInterval(new Date());

    const { timestamp, level } = user;

    const [lastRewards, todayProfitSent] = await Promise.all([
      this.findUserLastReward(timestamp),
      this.profitSentRepo.find({
        where: {
          daoUntilTime: { $gte: timestamp },
          dateSendReward: {
            $gte: start * 1000,
            $lte: end * 1000,
          },
        },
      }),
    ]);

    let todayProfit = 0;
    let daoPercent = 0;

    // summing all user latest reward with specific type
    for (let i = 0; i < todayProfitSent.length; i++) {
      const profit = todayProfitSent[i];
      daoPercent =
        AUTO_PROFIT_TYPE[type] ?? profit[REWARD_KEY_PERCENT_TYPE[type]];
      const daoTierPercent =
        await this.transactionService.findDaoPercentPerTier(
          profit.daoUntilTime
        );

      todayProfit =
        todayProfit +
        profit[REWARD_KEY_TYPE[type]] *
          (daoPercent / 100) *
          daoTierPercent[level];
    }

    const [lastUserRecord] = lastRewards;

    return [lastUserRecord, todayProfit];
  }

  async findProfitToEndDay(endTime: number) {
    const monthProfit = await this.profitSentRepo.find({
      where: {
        dateSendReward: { $lt: endTime * 1000 },
      },
      order: {
        dateSendReward: 'DESC',
      },
    });

    return monthProfit;
  }
}
