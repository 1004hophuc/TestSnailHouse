import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { DaoElementTransactionModule } from 'src/dao-element-transaction/dao-element-transaction.module';
import { ProfitModule } from 'src/profit/profit.module';

@Module({
  imports: [TransactionsModule, DaoElementTransactionModule, ProfitModule],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
