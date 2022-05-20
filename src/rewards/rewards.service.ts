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
      const reward = await this.rewardRepo.save(item);
      return reward;
    } catch (error) {
      return error;
    }
  }

  public async getListPaginate(page: number, limit: number) {
    try {
      const [data, total] = await this.rewardRepo.findAndCount({
        order: {
          dateReward: 'ASC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { data, total };
    } catch (error) {
      return error;
    }
  }

  public async findLatestReward() {
    try {
      const [lastRecord] = await this.rewardRepo.find({
        where: {
          isSent: true,
        },
        order: { dateReward: 'DESC' },
      });

      return lastRecord;
    } catch (error) {
      return error;
    }
  }

  public async findAll() {
    try {
      const rewards = await this.rewardRepo.find();
      return rewards;
    } catch (error) {
      return error;
    }
  }

  public async findOne(id: string) {
    try {
      const reward = await this.rewardRepo.findOne(id);
      return reward;
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
      await this.rewardRepo.delete({ dateReward: timestamp });
      return {
        message: 'Delete item successfully!',
      };
    } catch (error) {
      return error;
    }
  }
}
