import { Module } from '@nestjs/common';
import { AirdropsService } from './airdrops.service';
import { AirdropsController } from './airdrops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airdrop } from './entities/airdrop.entity';
import { TransactionsModule } from 'src/transactions/transactions.module';
@Module({
  imports: [TransactionsModule, TypeOrmModule.forFeature([Airdrop])],
  controllers: [AirdropsController],
  providers: [AirdropsService],
  exports: [AirdropsService],
})
export class AirdropsModule {}
