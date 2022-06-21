import { Module } from '@nestjs/common';
import { DaoElementTransactionService } from './dao-element-transaction.service';
import { DaoElementTransactionController } from './dao-element-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoElementTransaction } from './entities/dao-element-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DaoElementTransaction])],
  controllers: [DaoElementTransactionController],
  providers: [DaoElementTransactionService],
  exports: [DaoElementTransactionService],
})
export class DaoElementTransactionModule {}
