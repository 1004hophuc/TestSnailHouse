import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardsService } from 'src/rewards/rewards.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Repository } from 'typeorm';
import { Profit, PROFIT_TYPE } from './entities/profit.entity';
import { UserProfitDto } from './dto/user-profit.dto';
import { toWei } from 'src/utils/web3';
import { getCurrentTime, profitDao } from 'src/utils';

const TOTAL_REWARD_FIELD = 6;
const DAO_PROFIT_PERCENT = 70;
const SWAP_PROFIT_PERCENT = 10;

@Injectable()
export class ProfitService {
  constructor(
    @InjectRepository(Profit) private profitRepo: Repository<Profit>,
    private readonly transactionService: TransactionsService,
    private readonly rewardsService: RewardsService
  ) {}

  async calculateProfit(id: string) {
    try {
      //  Get dex profit
      const itemReward = await this.rewardsService.findOne(id);
      const {
        idoReward,
        swapReward,
        marketReward,
        dateReward,
        nftLaunchpadReward,
        nftGameReward,
        seedInvestReward,
      } = itemReward;

      // Get all dao user.
      const userDaoList = await this.transactionService.getAll();
      if (userDaoList.length <= 0) return { message: 'No DAO members' };

      //  Calculate ido,swap,market,nftLaunchpad,nftGame,seedInvest profit. (70% of dex profit, except swap is 10%)
      const totalDaoUser = userDaoList.length;

      const idoProfit = profitDao(idoReward, DAO_PROFIT_PERCENT, totalDaoUser);
      const swapProfit = profitDao(
        swapReward,
        SWAP_PROFIT_PERCENT,
        totalDaoUser
      );
      const marketProfit = profitDao(
        marketReward,
        DAO_PROFIT_PERCENT,
        totalDaoUser
      );
      const nftLaunchpadProfit = profitDao(
        nftLaunchpadReward,
        DAO_PROFIT_PERCENT,
        totalDaoUser
      );
      const nftGameProfit = profitDao(
        nftGameReward,
        DAO_PROFIT_PERCENT,
        totalDaoUser
      );
      const seedInvestProfit = profitDao(
        seedInvestReward,
        DAO_PROFIT_PERCENT,
        totalDaoUser
      );

      const dateSendReward = getCurrentTime();
      //  Mapping profit data of current reward.
      let profitArr = [];
      userDaoList.forEach((user) => {
        const userDefaultData = {
          user: user.address,
          dateReward,
          totalDaoUser,
          isWithdraw: 0,
          dateSendReward,
          daoProfitPercent: DAO_PROFIT_PERCENT, // all DAO profit is 70% of the Reward, except swap
        };
        const idoProfitData = {
          ...userDefaultData,
          amountProfit: idoProfit,
          weiAmountProfit: toWei(idoProfit),
          type: PROFIT_TYPE.IDO,
          dexProfit: idoReward,
        };
        const swapProfitData = {
          ...userDefaultData,
          amountProfit: swapProfit,
          weiAmountProfit: toWei(swapProfit),
          type: PROFIT_TYPE.SWAP,
          dexProfit: swapReward,
          daoProfitPercent: SWAP_PROFIT_PERCENT, // swap is 10%
        };
        const marketProfitData = {
          ...userDefaultData,
          amountProfit: marketProfit,
          weiAmountProfit: toWei(marketProfit),
          type: PROFIT_TYPE.MARKET,
          dexProfit: marketReward,
        };

        const nftLaunchpadProfitData = {
          ...userDefaultData,
          amountProfit: nftLaunchpadProfit,
          weiAmountProfit: toWei(nftLaunchpadProfit),
          type: PROFIT_TYPE.NFTLAUNCHPAD,
          dexProfit: nftLaunchpadReward,
        };

        const nftGameProfitData = {
          ...userDefaultData,
          amountProfit: nftGameProfit,
          weiAmountProfit: toWei(nftGameProfit),
          type: PROFIT_TYPE.NFTGAME,
          dexProfit: nftGameReward,
        };

        const seedInvestProfitData = {
          ...userDefaultData,
          amountProfit: seedInvestProfit,
          weiAmountProfit: toWei(seedInvestProfit),
          type: PROFIT_TYPE.SEEDINVEST,
          dexProfit: seedInvestReward,
        };

        profitArr = [
          ...profitArr,
          idoProfitData,
          swapProfitData,
          marketProfitData,
          nftLaunchpadProfitData,
          nftGameProfitData,
          seedInvestProfitData,
        ];
      });

      await this.profitRepo.save(profitArr);
      itemReward.isSent = true;
      delete itemReward.id;
      this.rewardsService.update(id, itemReward);

      return {
        statusCode: 200,
        message: 'Calculation success!',
      };
    } catch (error) {
      return error;
    }
  }

  async userProfitHistory(query: UserProfitDto) {
    try {
      const profits = await this.profitRepo.find({
        where: query,
        select: [
          'user',
          'type',
          'amountProfit',
          'weiAmountProfit',
          'daoProfitPercent',
          'totalDaoUser',
          'dateReward',
        ],
      });
      return profits;
    } catch (error) {
      return error;
    }
  }

  async profitByUser(user: string, type: PROFIT_TYPE) {
    try {
      const latestReward = await this.rewardsService.findLatestReward();
      if (!latestReward) return {};

      const [latestProfit, usersByType, allWithdrawedUsers] = await Promise.all(
        [
          await this.profitRepo.findOne({
            where: {
              user,
              type,
              dateReward: latestReward.dateReward,
            },
          }),
          await this.profitRepo.find({
            where: {
              user,
              type,
            },
          }),
          await this.profitRepo.find({
            where: {
              user,
              type,
              isWithdraw: 1,
            },
          }),
        ]
      );

      const totalUserWithdraw = allWithdrawedUsers.reduce(
        (sum, element) => (sum += element.amountProfit),
        0
      );

      const totalUserProfit = usersByType.reduce(
        (sum, element) => (sum += element.amountProfit),
        0
      );
      const { dexProfit, totalDaoUser, daoProfitPercent, amountProfit } =
        latestProfit;

      const data = {
        daoProfit: dexProfit,
        daoProfitPercent,
        totalDaoUser,
        profitPerUser: amountProfit,
        totalUserProfit,
        totalWithdraw: totalUserWithdraw,
        withdrawAvailable: totalUserProfit - totalUserWithdraw,
        dateReward: latestReward.dateReward,
      };

      return data;
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const userProfits = await this.profitRepo.find();
      return userProfits;
    } catch (error) {
      return error;
    }
  }

  async profitByMonth(timestamp: number, page: number, limit: number) {
    try {
      const [data, total] = await this.profitRepo.findAndCount({
        where: {
          dateReward: timestamp,
        },
        skip: (page - 1) * limit * TOTAL_REWARD_FIELD,
        take: limit * TOTAL_REWARD_FIELD,
      });

      let monthProfit = [];
      let userMonthProfit: any;
      for (let i = 0; i < data.length; i += TOTAL_REWARD_FIELD) {
        userMonthProfit = {
          id: data[i].id,
          user: data[i].user,
          totalDaoUser: data[i].totalDaoUser,
          dateReward: data[i].dateReward,
          dateSendReward: data[i].dateSendReward,
          amountProfit: {
            ido: data[i].amountProfit,
            swap: data[i + 1].amountProfit,
            market: data[i + 2].amountProfit,
            nftLaunchpad: data[i + 3].amountProfit,
            nftGame: data[i + 4].amountProfit,
            seedInvest: data[i + 5].amountProfit,
          },
          dexProfit: {
            ido: data[i].dexProfit,
            swap: data[i + 1].dexProfit,
            market: data[i + 2].dexProfit,
            nftLaunchpad: data[i + 3].dexProfit,
            nftGame: data[i + 4].dexProfit,
            seedInvest: data[i + 5].dexProfit,
          },
        };
        monthProfit = [...monthProfit, userMonthProfit];
      }

      return {
        data: monthProfit,
        total: total / TOTAL_REWARD_FIELD,
      };
    } catch (error) {
      return error;
    }
  }
}
