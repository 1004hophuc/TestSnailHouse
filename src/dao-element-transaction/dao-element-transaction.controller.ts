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


@Controller('dao-element-transaction')
export class DaoElementTransactionController {
  constructor(
    private readonly daoElementTransactionService: DaoElementTransactionService
  ) {}

  @Get()
  getPastEvent() {
    return this.daoElementTransactionService.getRouterTransaction();
  }
  

  @Get('cork-price')
  getCorkPrice() {
    return this.daoElementTransactionService.corkPriceToBUSD();
  }
}
