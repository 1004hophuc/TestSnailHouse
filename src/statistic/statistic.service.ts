import { Injectable } from '@nestjs/common';
import { DaoElementTransactionService } from 'src/dao-element-transaction/dao-element-transaction.service';
import { ElementType } from 'src/dao-element-transaction/entities/dao-element-transaction.entity';
import { ProfitService } from 'src/profit/profit.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';

@Injectable()
export class StatisticService {
  constructor(
    private transactionService: TransactionsService,
    private daoElementService: DaoElementTransactionService,
    private profitService: ProfitService
  ) {}
  create(createStatisticDto: CreateStatisticDto) {
    return 'This action adds a new statistic';
  }

  async findTransactionByMonth(month: number) {
    const transactionMonth = await this.transactionService.getMonthTransactions(
      month
    );

    return transactionMonth;
  }

  async findTotalProfits(month: number) {
    const totalProfit = await this.profitService.getStatisticProfitPerMonth(
      month
    );

    return totalProfit;
  }

  async findRewardTypeByMonth(type: ElementType, month: number) {
    const transactionMonth = await this.daoElementService.getMonthTransactions(
      type,
      month
    );

    return transactionMonth;
  }

  findOne(id: number) {
    return `This action returns a #${id} statistic`;
  }

  update(id: number, updateStatisticDto: UpdateStatisticDto) {
    return `This action updates a #${id} statistic`;
  }

  remove(id: number) {
    return `This action removes a #${id} statistic`;
  }
}
