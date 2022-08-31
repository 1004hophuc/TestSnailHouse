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

  @Get('router')
  getRouter() {
    return this.daoElementTransactionService.getRouterTransaction();
  }

  @Get('market')
  getMarket() {
    return this.daoElementTransactionService.getMarketTransaction();
  }

  @Get('cork-price')
  getCorkPrice() {
    return this.daoElementTransactionService.corkPriceToBUSD();
  }
}
