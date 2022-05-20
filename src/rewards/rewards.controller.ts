import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  public async create(@Body() createRewardDto: CreateRewardDto) {
    const createReward = await this.rewardsService.create(createRewardDto);
    return createReward;
  }

  @Get('pagination')
  public async getPagination(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    const resData = await this.rewardsService.getListPaginate(page, limit);
    return resData;
  }

  @Get()
  public async findAll() {
    const resData = await this.rewardsService.findLatestReward();
    return resData;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rewardsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRewardDto: UpdateRewardDto) {
    return this.rewardsService.update(id, {
      ...updateRewardDto,
    });
  }

  @Delete(':timestamp')
  remove(@Param('timestamp') timestamp: string) {
    return this.rewardsService.remove(+timestamp);
  }
}
