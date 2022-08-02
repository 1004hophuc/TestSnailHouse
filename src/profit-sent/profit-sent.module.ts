import { Module } from '@nestjs/common';
import { ProfitSentService } from './profit-sent.service';
import { ProfitSentController } from './profit-sent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfitSent } from './entities/profit-sent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfitSent])],
  controllers: [ProfitSentController],
  providers: [ProfitSentService],
  exports: [ProfitSentService],
})
export class ProfitSentModule {}
