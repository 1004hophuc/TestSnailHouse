import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { UserAsk } from './entities/user-ask.entity';
import { UserAskController } from './user-ask.controller';
import { UserAskService } from './user-ask.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAsk]), TransactionsModule],
  controllers: [UserAskController],
  providers: [UserAskService],
  exports: [UserAskService],
})
export class UserAskModule {}
