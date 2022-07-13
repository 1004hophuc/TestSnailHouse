import { Module } from '@nestjs/common';
import { VotingService } from './voting.service';
import { VotingController } from './voting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voting } from './entities/voting.entity';
import { ConfigurationModule } from 'src/configuration/configuration.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voting]), ConfigurationModule],
  controllers: [VotingController],
  providers: [VotingService],
  exports: [VotingService],
})
export class VotingModule {}
