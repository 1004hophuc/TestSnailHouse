import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from 'src/rewards/entities/reward.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Repository } from 'typeorm';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UpdateProfitDto } from './dto/update-profit.dto';
import { Profit } from './entities/profit.entity';
import Web3 from 'web3';
import { UserProfitDto } from './dto/user-profit.dto';

@Injectable()
export class ProfitService {
  constructor(
    @InjectRepository(Profit) private profitRepo: Repository<Profit>,
    private readonly transactionService: TransactionsService,
    private readonly rewardsService: RewardsService
  ) {}

  async calculateProfit(id: string) {
    try {
      //Get dex profit
      const itemReward = await this.rewardsService.findOne(id);
      const { idoReward, swapReward, marketReward, dateReward } = itemReward;
      // Get all dao user.
      const userDaoList = await this.transactionService.getAll();

      //Calculate ido,swap,market profit. (70% of dex profit)
      const totalDaoUser = userDaoList.length;
      const idoProfit = (idoReward * 0.7) / totalDaoUser;
      const swapProfit = (swapReward * 0.7) / totalDaoUser;
      const marketProfit = (marketReward * 0.7) / totalDaoUser;

      const dateSendReward = new Date().getTime();

      //Mapping profit data of current reward.
      let profitArr = [];
      userDaoList.forEach((user) => {
        const userDefaultData = {
          user: user.address,
          daoProfitPercent: 70, // 70%
          dateReward,
          totalDaoUser,
          isWithdraw: 0,
          dateSendReward,
        };
        const idoProfitData = {
          ...userDefaultData,
          amountProfit: idoProfit,
          weiAmountProfit: Web3.utils.toWei(idoProfit + ''),
          type: 'ido',
          dexProfit: idoReward,
        };
        const swapProfitData = {
          ...userDefaultData,
          amountProfit: swapProfit,
          weiAmountProfit: Web3.utils.toWei(swapProfit + ''),
          type: 'swap',
          dexProfit: swapReward,
        };
        const marketProfitData = {
          ...userDefaultData,
          amountProfit: marketProfit,
          weiAmountProfit: Web3.utils.toWei(marketProfit + ''),
          type: 'market',
          dexProfit: marketReward,
        };

        profitArr = [
          ...profitArr,
          idoProfitData,
          swapProfitData,
          marketProfitData,
        ];
      });
      itemReward.isSent = true;
      delete itemReward.id;
      this.rewardsService.update(id, itemReward);
      await this.profitRepo.save(profitArr);

      return {
        statusCode: 200,
        message: 'Calculation success!',
      };
    } catch (error) {
      return error;
    }
  }

  async getUserProfitHistory(query: UserProfitDto) {
    try {
      const profitRes = await this.profitRepo.find({
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
      return profitRes;
    } catch (error) {
      return error;
    }
  }

  async profitByUser(user: string, type: string) {
    try {
      const rewardRes = await this.rewardsService.findLatestReward();
      if (!rewardRes) return {};

      const userProfitRes = await this.profitRepo.findOne({
        where: {
          user,
          type,
          dateReward: rewardRes.dateReward,
        },
      });

      const userProfitResList = await this.profitRepo.find({
        where: {
          user,
          type,
        },
      });

      const userWithdrawedList = await this.profitRepo.find({
        where: {
          user,
          type,
          isWithdraw: 1,
        },
      });

      const totalWithdraw = userWithdrawedList.reduce(
        (sum, element) => (sum += element.amountProfit),
        0
      );

      const totalUserProfit = userProfitResList.reduce(
        (sum, element) => (sum += element.amountProfit),
        0
      );
      const { dexProfit, totalDaoUser, daoProfitPercent, amountProfit } =
        userProfitRes;

      const data = {
        daoProfit: dexProfit,
        daoProfitPercent,
        totalDaoUser,
        profitPerUser: amountProfit,
        totalUserProfit,
        totalWithdraw,
        withdrawAvailable: totalUserProfit - totalWithdraw,
        dateReward: rewardRes.dateReward,
      };

      return data;
    } catch (error) {
      return error;
    }
  }

  create(createProfitDto: CreateProfitDto) {
    return 'This action adds a new profit';
  }

  async findAll() {
    try {
      const response = await this.profitRepo.find();
      return response;
    } catch (error) {
      return error;
    }
  }

  async profitByTimestamp(timestamp: string, page: string, limit: string) {
    try {
      const [data, total] = await this.profitRepo.findAndCount({
        where: {
          dateReward: +timestamp,
        },
        skip: (+page - 1) * +limit * 3,
        take: +limit * 3,
      });

      let newData = [];
      let newUserData;
      for (let i = 0; i < data.length; i += 3) {
        newUserData = {
          id: data[i].id,
          user: data[i].user,
          totalDaoUser: data[i].totalDaoUser,
          dateReward: data[i].dateReward,
          dateSendReward: data[i].dateSendReward,
          amountProfit: {
            ido: data[i].amountProfit,
            swap: data[i + 1].amountProfit,
            market: data[i + 2].amountProfit,
          },
          dexProfit: {
            ido: data[i].dexProfit,
            swap: data[i + 1].dexProfit,
            market: data[i + 2].dexProfit,
          },
        };
        newData = [...newData, newUserData];
      }

      return {
        data: newData,
        total: total / 3,
      };
    } catch (error) {
      return error;
    }
  }

  update(id: number, updateProfitDto: UpdateProfitDto) {
    return `This action updates a #${id} profit`;
  }

  remove(id: number) {
    return `This action removes a #${id} profit`;
  }
}
