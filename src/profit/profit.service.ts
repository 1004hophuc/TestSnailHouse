import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardsService } from 'src/rewards/rewards.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Repository } from 'typeorm';
import { Profit, PROFIT_TYPE } from './entities/profit.entity';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UserProfitDto } from './dto/user-profit.dto';
import { toWei } from 'src/utils/web3';
import { getCurrentTime, profitDao } from 'src/utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProfitSentService } from 'src/profit-sent/profit-sent.service';

const TOTAL_REWARD_FIELD = 6;
const DAO_PROFIT_PERCENT = 70;
const SWAP_PROFIT_PERCENT = 10;

@Injectable()
export class ProfitService {
  constructor(
    @InjectRepository(Profit) private profitRepo: Repository<Profit>,
    private readonly transactionService: TransactionsService,
    private readonly rewardsService: RewardsService,
    private readonly profitSentService: ProfitSentService
  ) {}

  // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async calculateProfit(id: string) {
    try {
      const itemReward = await this.rewardsService.findOne(id);
      const {
        idoReward,
        swapReward,
        marketReward,
        nftLaunchpadReward,
        nftGameReward,
        seedInvestReward,
        isSent,
      } = itemReward;
      if (isSent) return;

      // Get all DAO user.
      const userDaoList = await this.transactionService.getByStaked(true);
      const totalDaoUser = userDaoList.length;

      if (totalDaoUser <= 0) return { message: 'No DAO members' };

      //  Calculate ido, swap, market, nftLaunchpad, nftGame, seedInvest profit.
      // (70% of dex profit, except swap is 10%)
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

      //  Mapping profit data of current reward.
      // all DAO profit is 70% of the Reward, except swap

      let newUserList = [];

      for (let i = 0; i < userDaoList.length; i++) {
        const user = userDaoList[i];

        const userDefaultData = {
          user: user.address,
          daoProfitPercent: DAO_PROFIT_PERCENT,
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

        const TYPE_DATA = {
          [PROFIT_TYPE.IDO]: idoProfitData,
          [PROFIT_TYPE.SWAP]: swapProfitData,
          [PROFIT_TYPE.MARKET]: marketProfitData,
          [PROFIT_TYPE.NFTLAUNCHPAD]: nftLaunchpadProfitData,
          [PROFIT_TYPE.NFTGAME]: nftGameProfitData,
          [PROFIT_TYPE.SEEDINVEST]: seedInvestProfitData,
        };

        const existUsers = await this.profitRepo.find({ user });
        if (existUsers.length <= 0) {
          newUserList = [
            ...newUserList,
            idoProfitData,
            swapProfitData,
            marketProfitData,
            nftLaunchpadProfitData,
            nftGameProfitData,
            seedInvestProfitData,
          ];
          continue;
        }

        for (let j = 0; j < existUsers.length; j++) {
          const existUser = existUsers[j];
          const type = existUser.type;

          const newData = {
            ...TYPE_DATA[type],
            amountProfit: TYPE_DATA[type].amountProfit + existUser.amountProfit,
            weiAmountProfit: toWei(
              TYPE_DATA[type].amountProfit + existUser.amountProfit
            ),
            dexProfit: TYPE_DATA[type].dexProfit + existUser.dexProfit,
          };

          await this.profitRepo.update({ user, type }, newData);
        }
      }

      await this.profitRepo.save(newUserList);

      // await this.

     
      itemReward.isSent = true;
      delete itemReward.id;
      this.rewardsService.update(id, itemReward);

      return {
        statusCode: 200,
        message: 'Calculation success!',
      };
    } catch (error) {
      console.log('error:', error);
      return error;
    }
  }

  async calculateProfitWithType(user: string, type: PROFIT_TYPE, newData: any) {
    await Promise.all([]);
  }

  async userProfitHistory(query: UserProfitDto) {
    const { user, type } = query;
    try {
      const profits = await this.profitRepo.find({
        where: {
          user,
          type,
        },
        select: [
          'user',
          'type',
          'amountProfit',
          'weiAmountProfit',
          'daoProfitPercent',
        ],
      });
      return profits;
    } catch (error) {
      return error;
    }
  }

  async profitUserWithType(user: string, type: PROFIT_TYPE) {
    try {
      const latestReward = await this.rewardsService.findLatestReward();

      if (!latestReward) return;

      const [userLatestProfit, usersByType, allWithdrawedUsers, latestProfit] =
        await Promise.all([
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

          await this.profitRepo.findOne({
            where: {
              type,
              dateReward: latestReward.dateReward,
            },
          }),
        ]);

      if (!userLatestProfit) {
        return {
          daoProfit: 0,
          daoProfitPercent: 0,
          totalDaoUser: 0,
          profitPerUser: 0,
          totalUserProfit: 0,
          totalWithdraw: 0,
          withdrawAvailable: 0,
        };
      }

      const totalUserWithdraw = allWithdrawedUsers.reduce(
        (sum, element) => (sum += element.amountProfit),
        0
      );
      const totalUserProfit = usersByType.reduce(
        (sum, element) => (sum += element.amountProfit),
        0
      );

      const { dexProfit, daoProfitPercent, amountProfit } = userLatestProfit;

      const data = {
        daoProfit: dexProfit,
        daoProfitPercent,
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

  async getTotalWithdrawAvailable(
    user: string,
    type: PROFIT_TYPE
  ): Promise<number> {
    const userProfit = await this.profitRepo.find({
      where: {
        user,
        type,
      },
    });

    const totalUserProfit = userProfit.reduce(
      (sum, element) => (sum += element.amountProfit),
      0
    );

    const userHasWithdraw = await this.profitRepo.find({
      where: {
        user,
        type,
        isWithdraw: 1,
      },
    });

    const totalUserHasWithdraw = userHasWithdraw.reduce(
      (sum, element) => (sum += element.amountProfit),
      0
    );

    return totalUserProfit - totalUserHasWithdraw;
  }

  async totalProfitByType(user: string, type: PROFIT_TYPE) {
    const usersProfitByType = await this.profitRepo.find({
      where: {
        user,
        type,
      },
    });
    const totalProfit = usersProfitByType.reduce(
      (sum, profit) => (sum += profit.amountProfit),
      0
    );
    return totalProfit;
  }

  async profitsTotalType(user: string) {
    // check if there was any user profit
    const profits = await this.findAll();
    if (profits.length <= 0) return {};

    // Type arr to get all the user total profit of each type
    const profitTypes = [
      PROFIT_TYPE.IDO,
      PROFIT_TYPE.SWAP,
      PROFIT_TYPE.MARKET,
      PROFIT_TYPE.SEEDINVEST,
      PROFIT_TYPE.NFTLAUNCHPAD,
      PROFIT_TYPE.NFTGAME,
    ];

    const profitTotal = profitTypes.reduce(
      async (tempObj: any, type: PROFIT_TYPE) => {
        const totalProfit = await this.totalProfitByType(user, type);
        const resolveObj = await tempObj; // wait for the previous obj done
        return {
          ...resolveObj,
          [type]: totalProfit,
        };
      },
      Promise.resolve({})
    );

    return profitTotal;
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
          // totalDaoUser: data[i].totalDaoUser,
          // dateReward: data[i].dateReward,
          // dateSendReward: data[i].dateSendReward,
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

  //   async updateUserWithdraw(user: string, type: PROFIT_TYPE) {
  //     await this.profitRepo.update({ user, type }, { isWithdraw: 1 });
  //   }
  //
}
