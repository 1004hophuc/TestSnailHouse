import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DaoElementTransactionService } from './dao-element-transaction.service';
import { CreateDaoElementTransactionDto } from './dto/create-dao-element-transaction.dto';
import { UpdateDaoElementTransactionDto } from './dto/update-dao-element-transaction.dto';

@Controller('dao-element-transaction')
export class DaoElementTransactionController {
  constructor(
    private readonly daoElementTransactionService: DaoElementTransactionService
  ) {}

  @Get()
  getPastEvent() {
    return this.daoElementTransactionService.getLaunchpadTransaction();
  }

  @Get('cork-price')
  getCorkPrice() {
    return this.daoElementTransactionService.corkPriceToBUSD();
  }
}
