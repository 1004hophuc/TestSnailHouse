import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProfitSentService } from './profit-sent.service';
import { CreateProfitSentDto } from './dto/create-profit-sent.dto';
import { UpdateProfitSentDto } from './dto/update-profit-sent.dto';

@Controller('profit-sent')
export class ProfitSentController {
  constructor(private readonly profitSentService: ProfitSentService) {}

  @Post()
  create(@Body() createProfitSentDto: CreateProfitSentDto) {
    return this.profitSentService.create(createProfitSentDto);
  }
}
