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
import { ProfitService } from './profit.service';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UpdateProfitDto } from './dto/update-profit.dto';

@Controller('profit')
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Post()
  create(@Body() createProfitDto: CreateProfitDto) {
    return this.profitService.create(createProfitDto);
  }

  @Get('/calculate/:id')
  calculateProfit(@Param('id') id: string) {
    return this.profitService.calculateProfit(id);
  }

  @Get()
  findAll() {
    return this.profitService.findAll();
  }

  @Get('byTime')
  findOne(
    @Query('timestamp') timestamp: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.profitService.profitByTimestamp(timestamp, page, limit);
  }

  @Get('userProfitHistory')
  getUserProfitHistory(
    @Query('account') user: string,
    @Query('dateReward') dateReward: number,
    @Query('type') type: string
  ) {
    if (dateReward)
      return this.profitService.getUserProfitHistory({
        user,
        dateReward,
        type,
      });
    return this.profitService.getUserProfitHistory({ user, type });
  }

  @Get('profitByUser')
  profitByUser(@Query('account') user: string, @Query('type') type: string) {
    return this.profitService.profitByUser(user, type);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfitDto: UpdateProfitDto) {
    return this.profitService.update(+id, updateProfitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profitService.remove(+id);
  }
}
