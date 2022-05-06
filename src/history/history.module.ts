import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { PendingWithdraw } from './entities/pending-withdraw.entity';

import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    UsersModule,
    TransactionsModule,
    TypeOrmModule.forFeature([History, PendingWithdraw]),
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
