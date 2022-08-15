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
import { StatisticService } from './statistic.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { ElementType } from 'src/dao-element-transaction/entities/dao-element-transaction.entity';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Post()
  create(@Body() createStatisticDto: CreateStatisticDto) {
    return this.statisticService.create(createStatisticDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statisticService.findOne(+id);
  }

  @Get('reward-by-month/get')
  findRewardTypeByMonth(
    @Query('type') type: ElementType,
    @Query('month') month: number
  ) {
    return this.statisticService.findRewardTypeByMonth(type, month);
  }

  @Get('transactions/:month')
  findTransactionByMonth(@Param('month') month: number) {
    return this.statisticService.findTransactionByMonth(month);
  }

  @Get('total-profit/:month')
  findTotalProfits(@Param('month') month: number) {
    return this.statisticService.findTotalProfits(month);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStatisticDto: UpdateStatisticDto
  ) {
    return this.statisticService.update(+id, updateStatisticDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statisticService.remove(+id);
  }
}
