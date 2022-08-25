import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { UserAskModule } from 'src/user-ask/user-ask.module';
import { UserAnswer } from './entities/user-answer.entity';
import { UserAnswerController } from './user-answer.controller';
import { UserAnswerService } from './user-answer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAnswer]),
    TransactionsModule,
    UserAskModule,
  ],
  controllers: [UserAnswerController],
  providers: [UserAnswerService],
  exports: [UserAnswerService],
})
export class UserAnswerModule {}
