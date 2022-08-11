import { Module } from '@nestjs/common';
import { ProfitMarketSentService } from './profit-market-sent.service';
import { ProfitMarketSentController } from './profit-market-sent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfitMarketSent } from './entities/profit-market-sent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfitMarketSent])],
  controllers: [ProfitMarketSentController],
  providers: [ProfitMarketSentService],
  exports: [ProfitMarketSentService],
})
export class ProfitMarketSentModule {}
