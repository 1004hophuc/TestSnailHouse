import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './entities/reward.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward) private rewardRepo: Repository<Reward>
  ) {}

  public async create(createRewardDto: CreateRewardDto) {
    try {
      const postResponse = await this.rewardRepo.save(createRewardDto);
      return postResponse;
    } catch (error) {
      return error;
    }
  }

  public async findAll() {
    try {
      const postResponse = await this.rewardRepo.find();
      return postResponse;
    } catch (error) {
      return error;
    }
  }

  public async findOne(id: string) {
    try {
      const postResponse = await this.rewardRepo.findOne(id);
      return postResponse;
    } catch (error) {
      return error;
    }
  }

  update(id: number, updateRewardDto: UpdateRewardDto) {
    return `This action updates a #${id} reward`;
  }

  remove(id: number) {
    return `This action removes a #${id} reward`;
  }
}
