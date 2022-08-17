import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { Reward } from './entities/reward.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), TransactionsModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
