import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async findLastRewards() {
    const [lastRecord] = await this.profitSentRepo.find({
      order: { dateSendReward: 'DESC' },
    });

    return lastRecord;
  }
}
