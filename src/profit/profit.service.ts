import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardsService } from 'src/rewards/rewards.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Repository } from 'typeorm';
import { Profit, PROFIT_TYPE } from './entities/profit.entity';
import { UserProfitDto } from './dto/user-profit.dto';
import { toWei } from 'src/utils/web3';
import { bigNumMul, getCurrentTime, profitDao } from 'src/utils';
import { ProfitSentService } from 'src/profit-sent/profit-sent.service';
import { ProfitWithdrawerService } from 'src/profit-withdrawer/profit-withdrawer.service';
import { ProfitSwapSentService } from 'src/profit-swap-sent/profit-swap-sent.service';
import {
  getCurrentInSecond,
  getDateInterval,
  getMonthTimeRange,
} from 'src/utils/helper';
import { ProfitMarketSentService } from 'src/profit-market-sent/profit-market-sent.service';
import { ProfitSent } from 'src/profit-sent/entities/profit-sent.entity';

const TOTAL_REWARD_FIELD = 6;
const DAO_PROFIT_PERCENT = 70;
const SWAP_PROFIT_PERCENT = 10;

// currently having automatically calculate swap profit & winery marketplace profit
const AUTO_PROFIT_TYPE = {
  [PROFIT_TYPE.SWAP]: SWAP_PROFIT_PERCENT,
  [PROFIT_TYPE.MARKET]: DAO_PROFIT_PERCENT,
};

export const REWARD_KEY_TYPE = {
  [PROFIT_TYPE.SWAP]: 'swapProfit',
  [PROFIT_TYPE.MARKET]: 'marketProfit',
  [PROFIT_TYPE.IDO]: 'idoProfit',
  [PROFIT_TYPE.NFTLAUNCHPAD]: 'nftLaunchpadProfit',
  [PROFIT_TYPE.NFTGAME]: 'nftGameProfit',
  [PROFIT_TYPE.SEEDINVEST]: 'seedInvestProfit',
};

export const REWARD_KEY_PERCENT_TYPE = {
  [PROFIT_TYPE.IDO]: 'idoPercent',
  [PROFIT_TYPE.NFTLAUNCHPAD]: 'nftLaunchpadPercent',
  [PROFIT_TYPE.NFTGAME]: 'nftGamePercent',
  [PROFIT_TYPE.SEEDINVEST]: 'seedInvestPercent',
};

@Injectable()
export class ProfitService {
  constructor(
    @InjectRepository(Profit) private profitRepo: Repository<Profit>,
    private readonly transactionService: TransactionsService,
    private readonly rewardsService: RewardsService,
    private readonly profitSentService: ProfitSentService,
    @Inject(forwardRef(() => ProfitWithdrawerService))
    private readonly profitWithdrawService: ProfitWithdrawerService,
    private readonly profitSwapService: ProfitSwapSentService,
    private readonly profitMarketService: ProfitMarketSentService
  ) {}

  async calculateProfit(id: string) {
    try {
      const itemReward = await this.rewardsService.findOne(id);
      const {
        idoReward,
        nftLaunchpadReward,
        nftGameReward,
        seedInvestReward,
        isSent,
        idoPercent,
        nftLaunchpadPercent,
        nftGamePercent,
        seedInvestPercent,
      } = itemReward;
      if (isSent) return;

      // Get all DAO user.
      const userDaoList = await this.transactionService.getByStaked(true);
      const totalDaoUser = userDaoList.length;

      if (totalDaoUser <= 0) return { message: 'No DAO members' };

      //  Calculate ido, swap, market, nftLaunchpad, nftGame, seedInvest profit.
      const idoProfit = profitDao(idoReward, idoPercent, totalDaoUser);

      const nftLaunchpadProfit = profitDao(
        nftLaunchpadReward,
        nftLaunchpadPercent,
        totalDaoUser
      );
      const nftGameProfit = profitDao(
        nftGameReward,
        nftGamePercent,
        totalDaoUser
      );
      const seedInvestProfit = profitDao(
        seedInvestReward,
        seedInvestPercent,
        totalDaoUser
      );

      let newUserList = [];

      for (let i = 0; i < userDaoList.length; i++) {
        const user = userDaoList[i];

        const idoProfitData = {
          user: user.address,
          amountProfit: idoProfit,
          weiAmountProfit: toWei(idoProfit),
          type: PROFIT_TYPE.IDO,
          dexProfit: idoReward,
        };

        const nftLaunchpadProfitData = {
          user: user.address,
          amountProfit: nftLaunchpadProfit,
          weiAmountProfit: toWei(nftLaunchpadProfit),
          type: PROFIT_TYPE.NFTLAUNCHPAD,
          dexProfit: nftLaunchpadReward,
        };

        const nftGameProfitData = {
          user: user.address,
          amountProfit: nftGameProfit,
          weiAmountProfit: toWei(nftGameProfit),
          type: PROFIT_TYPE.NFTGAME,
          dexProfit: nftGameReward,
        };

        const seedInvestProfitData = {
          user: user.address,
          amountProfit: seedInvestProfit,
          weiAmountProfit: toWei(seedInvestProfit),
          type: PROFIT_TYPE.SEEDINVEST,
          dexProfit: seedInvestReward,
        };

        const othersAutoProfit = Object.keys(AUTO_PROFIT_TYPE).map((key) => ({
          user: user.address,
          amountProfit: 0,
          weiAmountProfit: toWei(0),
          type: key,
          dexProfit: 0,
        }));

        const TYPE_DATA = {
          [PROFIT_TYPE.IDO]: idoProfitData,
          [PROFIT_TYPE.NFTLAUNCHPAD]: nftLaunchpadProfitData,
          [PROFIT_TYPE.NFTGAME]: nftGameProfitData,
          [PROFIT_TYPE.SEEDINVEST]: seedInvestProfitData,
        };

        const existUsers = await this.profitRepo.find({ user: user.address });
        if (existUsers.length <= 0) {
          // init data
          newUserList = [
            ...newUserList,
            ...othersAutoProfit,
            idoProfitData,
            nftLaunchpadProfitData,
            nftGameProfitData,
            seedInvestProfitData,
          ];
          continue;
        }

        for (let j = 0; j < existUsers.length; j++) {
          const existUser = existUsers[j];
          const { type, user } = existUser;

          if (AUTO_PROFIT_TYPE[type]) continue;

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

      if (newUserList.length > 0) await this.profitRepo.save(newUserList);

      const profitSent = {
        totalDaoUser,
        dateSendReward: getCurrentTime(),
        idoProfit,
        nftLaunchpadProfit,
        nftGameProfit,
        seedInvestProfit,
        idoPercent,
        nftLaunchpadPercent,
        nftGamePercent,
        seedInvestPercent,
      };

      await this.profitSentService.create(profitSent);

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

  async calculateAutoProfit(rewardAmount: number, type: PROFIT_TYPE) {
    const userDaoList = await this.transactionService.getByStaked(true);
    const totalDaoUser = userDaoList.length;
    if (totalDaoUser === 0)
      return {
        totalDaoUser,
        profit: 0,
      };

    const profit = profitDao(
      rewardAmount,
      AUTO_PROFIT_TYPE[type],
      totalDaoUser
    );

    let newUserList = [];

    for (let i = 0; i < userDaoList.length; i++) {
      const userDao = userDaoList[i];
      const userDefaultData = {
        user: userDao.address,
      };

      const othersAutoProfit = Object.keys(AUTO_PROFIT_TYPE)
        .filter((key) => key !== type)
        .map((key) => ({
          user: userDao.address,
          amountProfit: 0,
          weiAmountProfit: toWei(0),
          type: key,
          dexProfit: 0,
        }));

      const currentProfitData = {
        ...userDefaultData,
        amountProfit: profit,
        weiAmountProfit: toWei(profit),
        type,
        dexProfit: rewardAmount,
      };

      const idoProfitData = {
        ...userDefaultData,
        amountProfit: 0,
        weiAmountProfit: toWei(0),
        type: PROFIT_TYPE.IDO,
        dexProfit: 0,
      };

      const nftLaunchpadProfitData = {
        ...userDefaultData,
        amountProfit: 0,
        weiAmountProfit: toWei(0),
        type: PROFIT_TYPE.NFTLAUNCHPAD,
        dexProfit: 0,
      };

      const nftGameProfitData = {
        ...userDefaultData,
        amountProfit: 0,
        weiAmountProfit: toWei(0),
        type: PROFIT_TYPE.NFTGAME,
        dexProfit: 0,
      };

      const seedInvestProfitData = {
        ...userDefaultData,
        amountProfit: 0,
        weiAmountProfit: toWei(0),
        type: PROFIT_TYPE.SEEDINVEST,
        dexProfit: 0,
      };

      const existUser = await this.profitRepo.findOne({
        user: userDao.address,
        type,
      });
      if (!existUser) {
        // init data
        newUserList = [
          ...newUserList,
          ...othersAutoProfit,
          currentProfitData,
          idoProfitData,
          nftLaunchpadProfitData,
          nftGameProfitData,
          seedInvestProfitData,
        ];
        continue;
      }

      const newData = {
        ...currentProfitData,
        amountProfit: profit + existUser.amountProfit,
        weiAmountProfit: toWei(profit + existUser.amountProfit),
        dexProfit: rewardAmount + existUser.dexProfit,
      };

      await this.profitRepo.update({ user: existUser.user, type }, newData);
    }

    if (newUserList.length > 0) await this.profitRepo.save(newUserList);

    return {
      totalDaoUser,
      profit,
    };
  }

  async calculateSwapProfit(swapReward: number, timeSendReward: number) {
    const { totalDaoUser, profit } = await this.calculateAutoProfit(
      swapReward,
      PROFIT_TYPE.SWAP
    );

    if (totalDaoUser === 0) return;

    // Update profit-swap-sent Collection
    // Create new record following of timeSendReward everyday
    const { start } = getDateInterval(timeSendReward * 1000);

    const profitSwapSent = {
      totalDaoUser,
      dateSendReward: start * 1000,
      swapProfit: profit,
    };
    const profitSwap = await this.profitSwapService.findOne({
      dateSendReward: start * 1000,
    });

    if (!profitSwap) {
      await this.profitSwapService.create(profitSwapSent);
      return;
    }

    await this.profitSwapService.update(profitSwap.id, profitSwapSent);
  }

  async calculateMarketProfit(marketReward: number, timeSendReward: number) {
    const { totalDaoUser, profit } = await this.calculateAutoProfit(
      marketReward,
      PROFIT_TYPE.MARKET
    );

    if (totalDaoUser === 0) return;

    // Update profit-market-sent Collection
    // Create new record following of timeSendReward everyday
    const { start } = getDateInterval(timeSendReward * 1000);

    const profitMarketSent = {
      totalDaoUser,
      dateSendReward: start * 1000,
      marketProfit: profit,
    };
    const profitMarket = await this.profitMarketService.findOne({
      dateSendReward: start * 1000,
    });

    if (!profitMarket) {
      await this.profitMarketService.create(profitMarketSent);
      return;
    }

    await this.profitMarketService.update(profitMarket.id, profitMarketSent);
  }

  async userProfitHistory(query: UserProfitDto) {
    const { user, type } = query;
    try {
      const profits = await this.profitRepo.find({
        where: {
          user,
          type,
        },
        select: ['user', 'type', 'amountProfit', 'weiAmountProfit'],
      });

      return profits;
    } catch (error) {
      return error;
    }
  }

  async getRewardByType(user: string, type: PROFIT_TYPE) {
    let latestReward = null;
    let todayProfit = 0;
    let daoDividents = 0;
    let profitSentRewards = [];
    let todayReward = 0;

    const { start } = getDateInterval(new Date());

    if (type === PROFIT_TYPE.SWAP)
      latestReward = await this.profitSwapService.findLastRewards();
    else if (type === PROFIT_TYPE.MARKET)
      latestReward = await this.profitMarketService.findLastRewards();
    else
      [latestReward, todayProfit, profitSentRewards] =
        await this.profitSentService.findLastRewards(type);

    if (!latestReward) return { latestReward, todayReward, daoDividents };

    const { dexProfit } = await this.findOne({ user, type });

    // If the latestReward is this day, so user's todayReward is the latestReward profit
    if (
      latestReward.dateSendReward === start * 1000 &&
      AUTO_PROFIT_TYPE[type]
    ) {
      todayReward = latestReward[REWARD_KEY_TYPE[type]] || 0;
    } else {
      todayReward = todayProfit;
      daoDividents = profitSentRewards.reduce((accu, reward: ProfitSent) => {
        if (accu === dexProfit) return accu;
        return (accu += bigNumMul(
          reward[REWARD_KEY_TYPE[type]],
          reward.totalDaoUser
        ));
      }, 0);
    }

    if (AUTO_PROFIT_TYPE[type]) {
      daoDividents = (dexProfit * AUTO_PROFIT_TYPE[type]) / 100;
    }

    return { latestReward, todayReward, daoDividents };
  }

  async profitUserWithType(user: string, type: PROFIT_TYPE) {
    try {
      const { latestReward, todayReward, daoDividents } =
        await this.getRewardByType(user, type);

      const userProfit = await this.profitRepo.findOne({
        where: {
          user,
          type,
        },
      });

      if (!userProfit) {
        return {
          daoProfit: 0,
          daoProfitPercent: 0,
          totalDaoUser: 0,
          profitPerUser: 0,
          totalUserProfit: 0,
          totalWithdraw: 0,
          withdrawAvailable: 0,
          dateReward: latestReward.dateSendReward,
          todayReward: 0,
        };
      }

      const withdrawAvailable = await this.getTotalWithdrawAvailable(
        user,
        type
      );

      const userWithdrawHistory = await this.profitWithdrawService.findAll(
        user,
        type
      );
      const totalUserWithdrawed = userWithdrawHistory.reduce(
        (accu, withdrawHistory) => (accu += withdrawHistory.amountWithdraw),
        0
      );

      const data = {
        daoProfit: userProfit.dexProfit,
        daoDividents,
        profitPerUser: userProfit.amountProfit,
        totalUserProfit: userProfit.amountProfit,
        totalWithdraw: totalUserWithdrawed,
        withdrawAvailable,
        dateReward: latestReward.dateSendReward,
        totalDaoUser: latestReward.totalDaoUser,
        todayReward,
      };

      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getTotalWithdrawAvailable(
    user: string,
    type: PROFIT_TYPE
  ): Promise<number> {
    const userWithdrawHistory = await this.profitWithdrawService.findAll(
      user,
      type
    );
    const userProfit = await this.profitRepo.findOne({
      where: {
        user,
        type,
      },
    });
    if (userWithdrawHistory.length === 0) return userProfit.amountProfit;

    const totalUserWithdrawed = userWithdrawHistory.reduce(
      (accu, withdrawHistory) => (accu += withdrawHistory.amountWithdraw),
      0
    );

    return userProfit.amountProfit - totalUserWithdrawed;
  }

  async totalProfitByType(user: string, type: PROFIT_TYPE) {
    const userProfit = await this.profitRepo.findOne({
      where: {
        user,
        type,
      },
    });
    return userProfit?.amountProfit || 0;
  }

  async profitsTotalType(user: string) {
    // check if there was any user profit
    const profits = await this.findAll();
    const totalProfit = {
      total: 0,
      today: 0,
    };
    let profitTotal;

    const profitTypes = [
      PROFIT_TYPE.IDO,
      PROFIT_TYPE.SWAP,
      PROFIT_TYPE.MARKET,
      PROFIT_TYPE.SEEDINVEST,
      PROFIT_TYPE.NFTLAUNCHPAD,
      PROFIT_TYPE.NFTGAME,
    ];
    profitTotal = profitTypes.reduce((tempObj: any, type: PROFIT_TYPE) => {
      return {
        ...tempObj,
        [type]: {
          total: 0,
          todayReward: 0,
        },
      };
    }, {});

    if (profits.length <= 0) return { ...profitTotal, totalProfit };

    profitTotal = await profitTypes.reduce(
      async (tempObj: any, type: PROFIT_TYPE) => {
        const total = await this.totalProfitByType(user, type);

        let { todayReward } = await this.getRewardByType(user, type);
        totalProfit.total += total;
        totalProfit.today += todayReward;

        const resolveObj = await tempObj; // wait for the previous obj done

        if (total < todayReward) todayReward = total;
        return {
          ...resolveObj,
          [type]: {
            total,
            todayReward,
          },
        };
      },
      Promise.resolve({})
    );

    if (totalProfit.total < totalProfit.today)
      totalProfit.today = totalProfit.total;
    return {
      ...profitTotal,
      totalProfit,
    };
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

  async findOne(query: any) {
    const response = await this.profitRepo.findOne(query);
    return response;
  }

  async getStatisticProfitPerMonth(month: number) {
    const { start, end, daysInMonth } = getMonthTimeRange(month);

    const [marketProfit, swapProfit, othersProfit] = await Promise.all([
      this.profitMarketService.findProfitToEndDay(end),
      this.profitSwapService.findProfitToEndDay(end),
      this.profitSentService.findProfitToEndDay(end),
    ]);

    let startOfDay: number;
    const currentTime = getCurrentTime();

    const profitFromMonth = [...Array(daysInMonth).keys()]
      .map((i) => {
        startOfDay = start + 86400 * i;
        const endOfDay = startOfDay + 86399;

        const marketTotal = marketProfit
          .filter((profitSent) => profitSent.dateSendReward / 1000 <= endOfDay)
          .reduce(
            (accu, profitSent) =>
              (accu += profitSent.marketProfit * profitSent.totalDaoUser),
            0
          );

        const swapTotal = swapProfit
          .filter((profitSent) => profitSent.dateSendReward / 1000 <= endOfDay)
          .reduce(
            (accu, profitSent) =>
              (accu += profitSent.swapProfit * profitSent.totalDaoUser),
            0
          );

        const profitTotal = othersProfit
          .filter((profitSent) => profitSent.dateSendReward / 1000 <= endOfDay)
          .reduce((accu, profitSent) => {
            const { totalDaoUser } = profitSent;
            return (accu += Object.keys(REWARD_KEY_TYPE).reduce(
              (dayTotal, type) =>
                AUTO_PROFIT_TYPE[type]
                  ? dayTotal
                  : (dayTotal +=
                      profitSent[REWARD_KEY_TYPE[type]] * totalDaoUser),
              0
            ));
          }, 0);

        return {
          time: startOfDay * 1000,
          value: marketTotal + swapTotal + profitTotal,
        };
      })
      .filter((dayValue) => dayValue.time < currentTime);
    return profitFromMonth;
  }
}
