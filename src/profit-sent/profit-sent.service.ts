import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';
import { REWARD_KEY_TYPE } from 'src/profit/profit.service';
import { getDateInterval } from 'src/utils/helper';
import { Repository } from 'typeorm';
import { CreateProfitSentDto } from './dto/create-profit-sent.dto';
import { UpdateProfitSentDto } from './dto/update-profit-sent.dto';
import { ProfitSent } from './entities/profit-sent.entity';

@Injectable()
export class ProfitSentService {
  constructor(
    @InjectRepository(ProfitSent) private profitSentRepo: Repository<ProfitSent>
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

  async findTodayProfitWithType(type: PROFIT_TYPE) {
    const { start, end } = getDateInterval(new Date());

    const [lastRecord, todayProfitSent] = await Promise.all([
      this.findLastReward(),
      this.profitSentRepo.find({
        where: {
          dateSendReward: {
            $gte: start * 1000,
            $lte: end * 1000,
          },
        },
      }),
    ]);

    const todayProfit = todayProfitSent.reduce(
      (accu, profit) => (accu += profit[REWARD_KEY_TYPE[type]]),
      0
    );

    return [lastRecord, todayProfit];
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
