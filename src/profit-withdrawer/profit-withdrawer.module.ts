import { Module } from '@nestjs/common';
import { ProfitWithdrawerService } from './profit-withdrawer.service';
import { ProfitWithdrawerController } from './profit-withdrawer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfitWithdrawer } from './entities/profit-withdrawer.entity';
import { ProfitModule } from 'src/profit/profit.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfitWithdrawer]),
    ProfitModule,
    TransactionsModule,
  ],
  controllers: [ProfitWithdrawerController],
  providers: [ProfitWithdrawerService],
  exports: [ProfitWithdrawerService],
})
export class ProfitWithdrawerModule {}
