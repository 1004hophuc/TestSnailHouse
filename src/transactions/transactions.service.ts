import { Injectable } from '@nestjs/common';
import { Transaction } from './transactions.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async findAll(query: QueryTransactionDto) {
    const { page, limit } = query;
    const [data, count] = await this.transactionsRepository.findAndCount({
      order: { createdAt: -1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const item = await this.transactionsRepository.create(createTransactionDto);
    const data = await this.transactionsRepository.save(item);
    return data;
  }
}
