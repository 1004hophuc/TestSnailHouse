import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { ProfitSent } from './entities/profit-sent.entity';
import { ProfitSentController } from './profit-sent.controller';
import { ProfitSentService } from './profit-sent.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfitSent]), TransactionsModule],
  controllers: [ProfitSentController],
  providers: [ProfitSentService],
  exports: [ProfitSentService],
})
export class ProfitSentModule {}
