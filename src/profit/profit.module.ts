import { Module } from '@nestjs/common';
import { ProfitService } from './profit.service';
import { ProfitController } from './profit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profit } from './entities/profit.entity';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { RewardsModule } from 'src/rewards/rewards.module';

@Module({
  imports: [
    RewardsModule,
    TransactionsModule,
    TypeOrmModule.forFeature([Profit]),
  ],
  controllers: [ProfitController],
  providers: [ProfitService],
  exports: [ProfitService],
})
export class ProfitModule {}
