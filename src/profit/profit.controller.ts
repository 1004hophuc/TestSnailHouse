import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UpdateProfitDto } from './dto/update-profit.dto';
import { PROFIT_TYPE } from './entities/profit.entity';
import { ProfitService } from './profit.service';

@Controller('profit')
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Get('/calculate/:id')
  calculateProfit(@Param('id') id: string) {
    return this.profitService.calculateProfit(id);
  }

  @Get()
  findAll() {
    return this.profitService.findAll();
  }

  @Get('byTime')
  profitByMonth(
    @Query('timestamp') timestamp: number,
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.profitService.profitByMonth(timestamp, page, limit);
  }

  @Get('userProfitHistory')
  userProfitHistory(
    @Query('account') user: string,
    @Query('type') type: PROFIT_TYPE
  ) {
    const lowercaseAddress = user.toLowerCase();

    return this.profitService.userProfitHistory({
      user: lowercaseAddress,
      type,
    });
  }
  @Get('profitByUser')
  profitByUser(
    @Query('account') user: string,
    @Query('type') type: PROFIT_TYPE
  ) {
    const lowercaseAddress = user.toLowerCase();
    return this.profitService.profitUserWithType(lowercaseAddress, type);
  }

  @Get('profitTotal')
  profitsTotalType(@Query('account') user: string) {
    const lowercaseAddress = user.toLowerCase();
    return this.profitService.profitsTotalType(lowercaseAddress);
  }

  @Get('initIDO')
  initIdo() {
    // return this.profitService.initIDOData();
  }
}
