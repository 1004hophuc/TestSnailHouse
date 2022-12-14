import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DaoElementTransactionService } from 'src/dao-element-transaction/dao-element-transaction.service';
import { ProfitMarketSentService } from 'src/profit-market-sent/profit-market-sent.service';
import { ProfitSentService } from 'src/profit-sent/profit-sent.service';
import { ProfitSwapSentService } from 'src/profit-swap-sent/profit-swap-sent.service';
import { ProfitWithdrawerService } from 'src/profit-withdrawer/profit-withdrawer.service';
import { RewardsService } from 'src/rewards/rewards.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { getCurrentTime, profitDao } from 'src/utils';
import { getDateInterval, getMonthTimeRange } from 'src/utils/helper';
import { toWei } from 'src/utils/web3';
import { Repository } from 'typeorm';
import { UserProfitDto } from './dto/user-profit.dto';
import { Profit, PROFIT_TYPE } from './entities/profit.entity';

const TOTAL_REWARD_FIELD = 6;
const DAO_PROFIT_PERCENT = 70;
const SWAP_PROFIT_PERCENT = 10;

// currently having automatically calculate swap profit & winery marketplace profit
export const AUTO_PROFIT_TYPE = {
  [PROFIT_TYPE.SWAP]: SWAP_PROFIT_PERCENT,
  [PROFIT_TYPE.MARKET]: DAO_PROFIT_PERCENT,
};

const TYPE_LIST = {
  [PROFIT_TYPE.SWAP]: 'swap',
  [PROFIT_TYPE.MARKET]: 'market',
  [PROFIT_TYPE.IDO]: 'ido',
  [PROFIT_TYPE.NFTLAUNCHPAD]: 'nftLaunchpad',
  [PROFIT_TYPE.NFTGAME]: 'nftGame',
  [PROFIT_TYPE.SEEDINVEST]: 'seedInvest',
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
    private readonly profitMarketService: ProfitMarketSentService,
    @Inject(forwardRef(() => DaoElementTransactionService))
    private readonly daoElementService: DaoElementTransactionService
  ) {}

  async calculateProfit(id: string) {
    try {
      const itemReward = await this.rewardsService.findOne(id);

      if (!itemReward) return;

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
        daoUntilTime,
      } = itemReward;

      if (isSent) return;

      const lastReward = await this.profitSentService.findLastReward();

      // Get all DAO members from the begining to daoUntilTime.
      const userDaoList = await this.transactionService.findAllFilter({
        isStaked: true,
        timestamp: { $lte: daoUntilTime },
      });
      const totalDaoUser = userDaoList.length;

      if (totalDaoUser <= 0) return { message: 'No DAO members' };

      const daoPerTier = await this.transactionService.findDaoPercentPerTier(
        daoUntilTime
      );

      const [swapReward, marketReward] = await Promise.all(
        Object.keys(AUTO_PROFIT_TYPE).map((autoType) =>
          this.daoElementService.totalCorkValueWithType(
            autoType,
            lastReward?.dateSendReward / 1000 || 0
          )
        )
      );

      const TYPE_REWARD = {
        [PROFIT_TYPE.IDO]: idoReward,
        [PROFIT_TYPE.NFTLAUNCHPAD]: nftLaunchpadReward,
        [PROFIT_TYPE.NFTGAME]: nftGameReward,
        [PROFIT_TYPE.SEEDINVEST]: seedInvestReward,
        [PROFIT_TYPE.SWAP]: swapReward,
        [PROFIT_TYPE.MARKET]: marketReward,
      };

      const TYPE_PROFIT = Object.keys(TYPE_LIST).reduce(
        (accu, type) => ({
          ...accu,
          [type]: profitDao(
            TYPE_REWARD[type],
            AUTO_PROFIT_TYPE[type] ?? itemReward[REWARD_KEY_PERCENT_TYPE[type]]
          ),
        }),
        {}
      );

      let newUserList = [];

      for (let i = 0; i < userDaoList.length; i++) {
        const { address, level } = userDaoList[i];

        const TYPE_DATA = Object.keys(TYPE_PROFIT).reduce(
          (temp, type) => ({
            ...temp,
            [type]: {
              user: address,
              amountProfit: daoPerTier[level] * TYPE_PROFIT[type],
              weiAmountProfit: toWei(daoPerTier[level] * TYPE_PROFIT[type]),
              type,
              dexProfit: TYPE_REWARD[type],
            },
          }),
          {}
        );

        const profitData = Object.values(TYPE_DATA).map((profit) => profit);

        const existUsers = await this.profitRepo.find({ user: address });
        if (existUsers.length <= 0) {
          // init data
          newUserList = [...newUserList, ...profitData];
          continue;
        }

        for (let j = 0; j < existUsers.length; j++) {
          const existUser = existUsers[j];
          const { type, user } = existUser;

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

      const autoProfit = Object.keys(AUTO_PROFIT_TYPE).reduce(
        (accu, autoType) => ({
          ...accu,
          [REWARD_KEY_TYPE[autoType]]:
            autoType === PROFIT_TYPE.MARKET ? marketReward : swapReward,
        }),
        { swapProfit: 0, marketProfit: 0 }
      );

      const profitSent = {
        totalDaoUser,
        dateSendReward: getCurrentTime(),
        idoProfit: idoReward,
        nftLaunchpadProfit: nftLaunchpadReward,
        nftGameProfit: nftGameReward,
        seedInvestProfit: seedInvestReward,
        idoPercent,
        nftLaunchpadPercent,
        nftGamePercent,
        seedInvestPercent,
        daoUntilTime,
        ...autoProfit,
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

    const profit = profitDao(rewardAmount, AUTO_PROFIT_TYPE[type]);

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

    const existProfit = await this.profitSwapService.findOne({
      dateSendReward: start * 1000,
    });

    const profitSwapSent = {
      totalDaoUser,
      dateSendReward: start * 1000,
      swapProfit: profit,
    };

    if (!existProfit) {
      await this.profitSwapService.create(profitSwapSent);
      return;
    }

    await this.profitSwapService.update(existProfit.id, {
      ...profitSwapSent,
      swapProfit: existProfit.swapProfit + profit,
    });
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

    const existProfitMarket = await this.profitMarketService.findOne({
      dateSendReward: start * 1000,
    });

    const profitMarketSent = {
      totalDaoUser,
      dateSendReward: start * 1000,
      marketProfit: profit,
    };

    if (!existProfitMarket) {
      await this.profitMarketService.create(profitMarketSent);
      return;
    }

    await this.profitMarketService.update(existProfitMarket.id, {
      ...profitMarketSent,
      marketProfit: existProfitMarket.marketProfit + profit,
    });
  }

  async userProfitHistory(query: UserProfitDto) {
    const { user, type } = query;

    const userProfitSentHistory =
      await this.profitSentService.findUserProfitSent(type, user);

    return userProfitSentHistory;
  }

  async getRewardByType(user: string, type: PROFIT_TYPE) {
    let userLatestReward = null;
    let daoDividends = 0;
    let todayReward: any = 0;
    let daoPercent = 0;

    const userProfit = await this.findOne({ user });

    if (!userProfit)
      return { userLatestReward, todayReward, daoDividends, daoPercent };
    const userTransaction = await this.transactionService.findOne({
      address: user,
    });

    if (!userTransaction)
      return { userLatestReward, todayReward, daoDividends, daoPercent };

    [userLatestReward, todayReward] =
      await this.profitSentService.findTodayProfitWithType(
        type,
        userTransaction
      );

    if (!userLatestReward)
      return { userLatestReward, todayReward, daoDividends, daoPercent };

    daoPercent =
      AUTO_PROFIT_TYPE[type] ?? userLatestReward[REWARD_KEY_PERCENT_TYPE[type]];

    daoDividends = (userLatestReward[REWARD_KEY_TYPE[type]] * daoPercent) / 100;

    return {
      todayReward,
      daoDividends,
      daoPercent,
      userLatestReward,
    };
  }

  async profitUserWithType(user: string, type: PROFIT_TYPE) {
    try {
      const { todayReward, daoDividends, daoPercent, userLatestReward } =
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
          daoDividends: 0,
          totalDaoUser: 0,
          profitPerUser: 0,
          totalUserProfit: 0,
          totalWithdraw: 0,
          withdrawAvailable: 0,
          dateReward: null,
          todayReward: 0,
        };
      }

      const [
        withdrawAvailable,
        withdrawHistory,
        { level },
        profitPercentPerTier,
      ] = await Promise.all([
        this.getTotalWithdrawAvailable(user, type),
        this.profitWithdrawService.findAll(user, type),
        this.transactionService.findOne({
          address: user,
        }),
        this.transactionService.findDaoPercentPerTier(
          userLatestReward.daoUntilTime
        ),
      ]);

      const daoProfit = userLatestReward[REWARD_KEY_TYPE[type]];

      const profitPerUser =
        daoProfit * (daoPercent / 100) * profitPercentPerTier[level];

      const totalUserWithdrew = withdrawHistory.reduce(
        (accu, history) => (accu += history.amountWithdraw),
        0
      );

      const data = {
        daoProfit: userLatestReward[REWARD_KEY_TYPE[type]],
        daoDividends,
        profitPerUser, // amountPerUser[type][level], // userProfit.amountProfit,
        totalUserProfit: userProfit.amountProfit,
        totalWithdraw: totalUserWithdrew,
        withdrawAvailable,
        dateReward: userLatestReward.dateSendReward,
        totalDaoUser: userLatestReward.totalDaoUser,
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

        const { todayReward } = await this.getRewardByType(user, type);
        totalProfit.total += total;
        totalProfit.today += todayReward;

        const resolveObj = await tempObj; // wait for the previous obj done

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

  // async initIDOData() {
  //   const users = await this.transactionService.findAllFilter({
  //     where: {
  //       timestamp: { $lte: 1660575600000, $gte: 1660521600000 },
  //       isStaked: true,
  //     },
  //   });

  //   const swap = {
  //     1: 0.5684832007,
  //     2: 1.705449602,
  //     3: 2.842416004,
  //     4: 5.684832007,
  //     5: 11.36966401,
  //   };

  //   const market = {
  //     1: 0.02643324364,
  //     2: 0.07929973091,
  //     3: 0.1321662182,
  //     4: 0.2643324364,
  //     5: 0.5286648727,
  //   };

  //   const ido = {
  //     1: 1.40456784,
  //     2: 4.213703521,
  //     3: 7.022839202,
  //     4: 14.0456784,
  //     5: 28.09135681,
  //   };

  //   const profitLevelType = {
  //     [PROFIT_TYPE.SWAP]: swap,
  //     [PROFIT_TYPE.MARKET]: market,
  //     [PROFIT_TYPE.IDO]: ido,
  //   };

  //   const dexProfit = {
  //     [PROFIT_TYPE.IDO]: 5346.4,
  //     [PROFIT_TYPE.SWAP]: 21352.22902,
  //     [PROFIT_TYPE.MARKET]: 141.833233,
  //   };

  //   let listUsers = [];
  //   for (let i = 0; i < users.length; i++) {
  //     const user = users[i];
  //     const { level, address } = user;
  //     const TYPE_DATA = Object.keys(TYPE_LIST).reduce(
  //       (temp, type) => ({
  //         ...temp,
  //         [type]: {
  //           user: address,
  //           amountProfit: profitLevelType[type]?.[level] ?? 0,
  //           weiAmountProfit: toWei(profitLevelType[type]?.[level] ?? 0),
  //           type,
  //           dexProfit: dexProfit[type] ?? 0,
  //         },
  //       }),
  //       {}
  //     );

  //     const profitData = Object.values(TYPE_DATA).map((profit) => profit);
  //     const existProfits = await this.profitRepo.find({ user: address });

  //     if (existProfits.length === 0) {
  //       listUsers = [...listUsers, ...profitData];
  //       continue;
  //     }
  //     for (let j = 0; j < existProfits.length; j++) {
  //       const existUser = existProfits[j];
  //       const { type, user } = existUser;

  //       if (!dexProfit[type]) continue;

  //       const newData = {
  //         amountProfit: +TYPE_DATA[type].amountProfit + existUser.amountProfit,
  //         weiAmountProfit: toWei(
  //           +TYPE_DATA[type].amountProfit + existUser.amountProfit
  //         ),
  //         dexProfit: TYPE_DATA[type].dexProfit + existUser.dexProfit,
  //       };

  //       await this.profitRepo.update({ user, type }, newData);
  //     }
  //   }

  //   // return listUsers;
  //   if (listUsers.length > 0) await this.profitRepo.save(listUsers);
  // }

  async resetMarket(type: PROFIT_TYPE) {
    const allMarketProfits = await this.profitRepo.find({
      type,
    });

    const promiseArr = allMarketProfits.map((profit) =>
      this.profitRepo.update(
        { user: profit.user, type },
        { amountProfit: 0, weiAmountProfit: '0', dexProfit: 0 }
      )
    );

    await Promise.all(promiseArr);
  }
}
