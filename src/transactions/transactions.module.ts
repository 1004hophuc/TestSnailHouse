import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transactions.entity';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NftService } from '../nft/nft.service';
import { NftImageService } from '../nft/nft-image.service';

import { NFT } from '../nft/nft.entity';
import { NFTImage } from '../nft/nft-image.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Transaction, NFT, NFTImage])],
  controllers: [TransactionsController],
  providers: [TransactionsService, NftService, NftImageService],
})
export class TransactionsModule {}
