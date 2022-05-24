import { Module } from '@nestjs/common';
import { MailSubmitService } from './mail-submit.service';
import { MailSubmitController } from './mail-submit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailSubmit } from './entities/mail-submit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MailSubmit])],
  controllers: [MailSubmitController],
  providers: [MailSubmitService],
  exports: [MailSubmitService],
})
export class MailSubmitModule {}
