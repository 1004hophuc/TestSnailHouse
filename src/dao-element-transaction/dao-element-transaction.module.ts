import { Module } from '@nestjs/common';
import { DaoElementTransactionService } from './dao-element-transaction.service';
import { DaoElementTransactionController } from './dao-element-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoElementTransaction } from './entities/dao-element-transaction.entity';
import { ProfitModule } from 'src/profit/profit.module';

@Module({
  imports: [TypeOrmModule.forFeature([DaoElementTransaction]), ProfitModule],
  controllers: [DaoElementTransactionController],
  providers: [DaoElementTransactionService],
  exports: [DaoElementTransactionService],
})
export class DaoElementTransactionModule {}
