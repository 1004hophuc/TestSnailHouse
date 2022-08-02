import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
import { ProfitWithdrawerService } from 'src/profit-withdrawer/profit-withdrawer.service';
import { ProfitSwapSentService } from 'src/profit-swap-sent/profit-swap-sent.service';
import { getDateInterval, getTodayInterval } from 'src/utils/helper';

const TOTAL_REWARD_FIELD = 6;
const DAO_PROFIT_PERCENT = 70;
const SWAP_PROFIT_PERCENT = 10;

@Injectable()
export class ProfitService {
  constructor(
    @InjectRepository(Profit) private profitRepo: Repository<Profit>,
    private readonly transactionService: TransactionsService,
    private readonly rewardsService: RewardsService,
    private readonly profitSentService: ProfitSentService,
    @Inject(forwardRef(() => ProfitWithdrawerService))
    private readonly profitWithdrawService: ProfitWithdrawerService,
    private readonly profitSwapService: ProfitSwapSentService
  ) {}

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
          [PROFIT_TYPE.MARKET]: marketProfitData,
          [PROFIT_TYPE.NFTLAUNCHPAD]: nftLaunchpadProfitData,
          [PROFIT_TYPE.NFTGAME]: nftGameProfitData,
          [PROFIT_TYPE.SEEDINVEST]: seedInvestProfitData,
        };

        const existUsers = await this.profitRepo.find({ user: user.address });
        if (existUsers.length <= 0) {
          // init data
          newUserList = [
            ...newUserList,
            idoProfitData,
            marketProfitData,
            nftLaunchpadProfitData,
            nftGameProfitData,
            seedInvestProfitData,
          ];
          continue;
        }

        for (let j = 0; j < existUsers.length; j++) {
          const existUser = existUsers[j];
          const { type, user } = existUser;
          if (type === PROFIT_TYPE.SWAP) continue;

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
        marketProfit,
        nftLaunchpadProfit,
        nftGameProfit,
        seedInvestProfit,
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

  async calculateSwapProfit(swapReward: number, timeSendReward: number) {
    const userDaoList = await this.transactionService.getByStaked(true);
    const totalDaoUser = userDaoList.length;
    if (totalDaoUser === 0) return;

    const swapProfit = profitDao(swapReward, SWAP_PROFIT_PERCENT, totalDaoUser);

    let newUserList = [];

    // Update profit collection
    for (let i = 0; i < userDaoList.length; i++) {
      const userDao = userDaoList[i];
      const userDefaultData = {
        user: userDao.address,
        daoProfitPercent: DAO_PROFIT_PERCENT,
      };

      const swapProfitData = {
        ...userDefaultData,
        amountProfit: swapProfit,
        weiAmountProfit: toWei(swapProfit),
        type: PROFIT_TYPE.SWAP,
        dexProfit: swapReward,
        daoProfitPercent: SWAP_PROFIT_PERCENT, // swap is 10%
      };

      const idoProfitData = {
        ...userDefaultData,
        amountProfit: 0,
        weiAmountProfit: toWei(0),
        type: PROFIT_TYPE.IDO,
        dexProfit: 0,
      };

      const marketProfitData = {
        ...userDefaultData,
        amountProfit: 0,
        weiAmountProfit: toWei(0),
        type: PROFIT_TYPE.MARKET,
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

      const existUsers = await this.profitRepo.find({ user: userDao.address });
      if (existUsers.length <= 0) {
        // init data
        newUserList = [
          ...newUserList,
          swapProfitData,
          idoProfitData,
          marketProfitData,
          nftLaunchpadProfitData,
          nftGameProfitData,
          seedInvestProfitData,
        ];
        continue;
      }

      for (let j = 0; j < existUsers.length; j++) {
        const existUser = existUsers[j];

        const newData = {
          ...swapProfitData,
          amountProfit: swapProfit + existUser.amountProfit,
          weiAmountProfit: toWei(swapProfit + existUser.amountProfit),
          dexProfit: swapReward + existUser.dexProfit,
        };

        await this.profitRepo.update(
          { user: existUser.user, type: PROFIT_TYPE.SWAP },
          newData
        );
      }
    }

    if (newUserList.length > 0) await this.profitRepo.save(newUserList);

    // Update profit-swap-sent Collection
    // Create new record following of timeSendReward
    // Update that record if timeSendReward is still in that day

    const { start, end } = getDateInterval(timeSendReward * 1000);

    const profitSwapSent = {
      totalDaoUser,
      dateSendReward: start * 1000,
      swapProfit,
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
      let latestReward = null;
      if (type !== PROFIT_TYPE.SWAP)
        latestReward = await this.profitSentService.findLastRewards();
      else latestReward = await this.profitSwapService.findLastRewards();

      if (!latestReward) return;

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
        daoProfitPercent: userProfit.daoProfitPercent,
        profitPerUser: userProfit.amountProfit,
        totalUserProfit: userProfit.amountProfit,
        totalWithdraw: totalUserWithdrawed,
        withdrawAvailable,
        dateReward: latestReward.dateSendReward,
        totalDaoUser: latestReward.totalDaoUser,
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
