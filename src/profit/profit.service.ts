import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from 'src/rewards/entities/reward.entity';
import { RewardsService } from 'src/rewards/rewards.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Repository } from 'typeorm';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UpdateProfitDto } from './dto/update-profit.dto';
import { Profit } from './entities/profit.entity';

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
          daoProfit: 70, // 70%
          dateReward,
          totalDaoUser,
          isWithdraw: 0,
          dateSendReward,
        };
        const idoProfitData = {
          ...userDefaultData,
          amountProfit: idoProfit,
          type: 'ido',
          dexProfit: idoReward,
        };
        const swapProfitData = {
          ...userDefaultData,
          amountProfit: swapProfit,
          type: 'swap',
          dexProfit: swapReward,
        };
        const marketProfitData = {
          ...userDefaultData,
          amountProfit: marketProfit,
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
      this.profitRepo.save(profitArr);

      return {
        statusCode: 200,
        message: 'Calculation success!',
      };
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

  async findOne(timestamp: string, page: string, limit: string) {
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
