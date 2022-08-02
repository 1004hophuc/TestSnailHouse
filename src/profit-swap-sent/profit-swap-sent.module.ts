import { Module } from '@nestjs/common';
import { ProfitSwapSentService } from './profit-swap-sent.service';
import { ProfitSwapSentController } from './profit-swap-sent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfitSwapSent } from './entities/profit-swap-sent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfitSwapSent])],
  controllers: [ProfitSwapSentController],
  providers: [ProfitSwapSentService],
  exports: [ProfitSwapSentService],
})
export class ProfitSwapSentModule {}
