import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProfitSwapSentService } from './profit-swap-sent.service';
import { CreateProfitSwapSentDto } from './dto/create-profit-swap-sent.dto';
import { UpdateProfitSwapSentDto } from './dto/update-profit-swap-sent.dto';

@Controller('profit-swap-sent')
export class ProfitSwapSentController {
  constructor(private readonly profitSwapSentService: ProfitSwapSentService) {}

  @Post()
  create(@Body() createProfitSwapSentDto: CreateProfitSwapSentDto) {
    return this.profitSwapSentService.create(createProfitSwapSentDto);
  }
}
