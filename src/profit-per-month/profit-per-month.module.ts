import { Module } from '@nestjs/common';
import { ProfitPerMonthService } from './profit-per-month.service';
import { ProfitPerMonthController } from './profit-per-month.controller';

@Module({
  controllers: [ProfitPerMonthController],
  providers: [ProfitPerMonthService]
})
export class ProfitPerMonthModule {}
