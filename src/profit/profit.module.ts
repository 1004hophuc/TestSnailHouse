import { forwardRef, Module } from '@nestjs/common';
import { ProfitService } from './profit.service';
import { ProfitController } from './profit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profit } from './entities/profit.entity';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { RewardsModule } from 'src/rewards/rewards.module';
import { ProfitSentModule } from 'src/profit-sent/profit-sent.module';
import { ProfitWithdrawerModule } from 'src/profit-withdrawer/profit-withdrawer.module';
import { ProfitSwapSentModule } from 'src/profit-swap-sent/profit-swap-sent.module';
import { ProfitMarketSentModule } from 'src/profit-market-sent/profit-market-sent.module';

@Module({
  imports: [
    RewardsModule,
    TransactionsModule,
    ProfitSentModule,
    forwardRef(() => ProfitWithdrawerModule),
    ProfitSwapSentModule,
    ProfitMarketSentModule,
    TypeOrmModule.forFeature([Profit]),
  ],
  controllers: [ProfitController],
  providers: [ProfitService],
  exports: [ProfitService],
})
export class ProfitModule {}
