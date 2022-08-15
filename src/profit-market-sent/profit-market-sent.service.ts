import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';
import { CreateProfitMarketSentDto } from './dto/create-profit-market-sent.dto';
import { UpdateProfitMarketSentDto } from './dto/update-profit-market-sent.dto';
import { ProfitMarketSent } from './entities/profit-market-sent.entity';

@Injectable()
export class ProfitMarketSentService {
  constructor(
    @InjectRepository(ProfitMarketSent)
    private profitMarketRepo: Repository<ProfitMarketSent>
  ) {}
  async find(query) {
    const profitMarkets = await this.profitMarketRepo.find(query);

    return profitMarkets;
  }

  async findOne(query: any) {
    const profitMarket = await this.profitMarketRepo.findOne(query);
    return profitMarket;
  }

  async create(createProfitMarketSentDto: CreateProfitMarketSentDto) {
    const profitMarketItem = this.profitMarketRepo.create(
      createProfitMarketSentDto
    );
    await this.profitMarketRepo.save(profitMarketItem);
  }

  async update(
    id: ObjectID,
    updateProfitMarketSentDto: UpdateProfitMarketSentDto
  ) {
    await this.profitMarketRepo.update(id, updateProfitMarketSentDto);
  }

  async findLastRewards() {
    const [lastRecord] = await this.profitMarketRepo.find({
      order: { dateSendReward: 'DESC' },
    });

    return lastRecord;
  }

  async findProfitToEndDay(endTime: number) {
    const monthProfit = await this.profitMarketRepo.find({
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
