import { Controller, Body, Post, Get, Query, Param } from '@nestjs/common';
import { CreateIDOTransactionDto } from './dto/create-ido-transaction.dto';
import { QueryIDOTransactionDto } from './dto/query-ido-transaction.dto';
import { IDOTransactionsService } from './ido-transaction.service';

@Controller('ido-transactions')
export class IDOTransactionsController {
  constructor(private readonly idoTransactionService: IDOTransactionsService) {}

  @Get('get-staked')
  getUserStaked(@Query() query: QueryIDOTransactionDto) {
    const { address } = query;
    if (!address) return false;
    return this.idoTransactionService.getUserStaked(address.toLowerCase());
  }

  @Get()
  async get(@Query() query: QueryIDOTransactionDto) {
    try {
      const data = await this.idoTransactionService.findAll(query);

      return {
        status: 200,
        ...data,
      };
    } catch (e) {
      console.log('e:', e);

      return {
        status: 500,
        message: 'Something went wrong',
      };
    }
  }

  @Get('/market')
  async detail(@Query() query) {
    try {
      const data = await this.idoTransactionService.findTransMarket(query);

      return {
        status: 200,
        ...data,
      };
    } catch (e) {
      console.log('e:', e);

      return {
        status: 500,
        message: 'Something went wrong',
      };
    }
  }

  @Post()
  async create(@Body() createTransactionDto: CreateIDOTransactionDto) {
    try {
      const data = await this.idoTransactionService.createTransaction(
        createTransactionDto
      );

      return {
        status: 200,
        data,
      };
    } catch (e) {
      return {
        status: 500,
        message: 'Something went wrong',
      };
    }
  }
}
