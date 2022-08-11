import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProfitMarketSentService } from './profit-market-sent.service';
import { CreateProfitMarketSentDto } from './dto/create-profit-market-sent.dto';

@Controller('profit-market-sent')
export class ProfitMarketSentController {
  constructor(
    private readonly profitMarketSentService: ProfitMarketSentService
  ) {}

  @Post()
  create(@Body() createProfitMarketSentDto: CreateProfitMarketSentDto) {
    return this.profitMarketSentService.create(createProfitMarketSentDto);
  }
}
