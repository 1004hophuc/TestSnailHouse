import { Module } from '@nestjs/common';

import { NftController } from './nft.controller';

import { NftService } from './nft.service';

import { NFT } from './nft.entity';

import { NFTImage } from './nft-image.entity';

import { NftImageService } from './nft-image.service';

import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([NFT, NFTImage])],
  controllers: [NftController],
  providers: [NftService, NftImageService],
})
export class NftModule {}
