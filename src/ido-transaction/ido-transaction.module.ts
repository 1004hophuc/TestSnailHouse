import { Module } from '@nestjs/common';
import { IDOTransactionsService } from './ido-transaction.service';
import { IDOTransaction } from './ido-transaction.entity';
import { IDOTransactionsController } from './ido-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigurationModule } from '../configuration/configuration.module';
import { IdoNftModule } from 'src/ido-nft/ido-nft.module';

@Module({
  imports: [
    ConfigurationModule,
    IdoNftModule,
    TypeOrmModule.forFeature([IDOTransaction]),
  ],
  controllers: [IDOTransactionsController],
  providers: [IDOTransactionsService],
  exports: [IDOTransactionsService],
})
export class IdoTransactionModule {}
