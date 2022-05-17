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

  public async create(createRewardDto: CreateRewardDto): Promise<any> {
    try {
      const existReward = await this.rewardRepo.findOne({
        dateReward: createRewardDto.dateReward,
      });

      if (existReward) {
        return {
          statusCode: 409,
          message: 'Item is already exist!',
        };
      }

      const item = this.rewardRepo.create(createRewardDto);
      item.isSent = false;
      const postResponse = await this.rewardRepo.save(item);
      return postResponse;
    } catch (error) {
      return error;
    }
  }

  public async getListPaginate(page: string, limit: string) {
    try {
      const [data, total] = await this.rewardRepo.findAndCount({
        order: {
          dateReward: 'ASC',
        },
        skip: (+page - 1) * +limit,
        take: +limit,
      });
      return { data, total };
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

  async update(id: string, updateRewardDto: UpdateRewardDto) {
    try {
      await this.rewardRepo.update(id, updateRewardDto);
      return {
        statusCode: 203,
        message: 'Item update successfully',
      };
    } catch (error) {
      return error;
    }
  }

  async remove(timestamp: number) {
    try {
      const affected = await this.rewardRepo.delete({ dateReward: timestamp });
      return affected;
    } catch (error) {
      return error;
    }

    // return `This action removes a #${id} reward`;
  }
}
