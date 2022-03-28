import { Controller, Body, Post, Get, Query } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async get(@Query() query: QueryTransactionDto) {
    try {
      const data = await this.transactionsService.findAll(query);

      return {
        status: 200,
        ...data,
      };
    } catch (e) {
      return {
        status: 500,
        message: 'Something went wrong',
      };
    }
  }

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    try {
      const data = await this.transactionsService.createTransaction(
        createTransactionDto,
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
