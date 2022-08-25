import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswerModule } from 'src/user-answer/user-answer.module';
import { UserAskModule } from 'src/user-ask/user-ask.module';
import { Faq } from './entities/faq.entity';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faq]), UserAskModule, UserAnswerModule],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
