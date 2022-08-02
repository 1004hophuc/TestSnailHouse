import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';
import { CreateProfitSwapSentDto } from './dto/create-profit-swap-sent.dto';
import { UpdateProfitSwapSentDto } from './dto/update-profit-swap-sent.dto';
import { ProfitSwapSent } from './entities/profit-swap-sent.entity';

@Injectable()
export class ProfitSwapSentService {
  constructor(
    @InjectRepository(ProfitSwapSent)
    private profitSwapRepo: Repository<ProfitSwapSent>
  ) {}

  async find(query) {
    const profitSwaps = await this.profitSwapRepo.find(query);

    return profitSwaps;
  }

  async findOne(query: any) {
    const profitSwap = await this.profitSwapRepo.findOne(query);
    return profitSwap;
  }

  async create(createProfitSwapSentDto: CreateProfitSwapSentDto) {
    const profitSwapItem = this.profitSwapRepo.create(createProfitSwapSentDto);
    await this.profitSwapRepo.save(profitSwapItem);
  }

  async update(id: ObjectID, updateProfitSwapSentDto: UpdateProfitSwapSentDto) {
    await this.profitSwapRepo.update(id, updateProfitSwapSentDto);
  }

  async findLastRewards() {
    const [lastRecord] = await this.profitSwapRepo.find({
      order: { dateSendReward: 'DESC' },
    });

    return lastRecord;
  }
}
