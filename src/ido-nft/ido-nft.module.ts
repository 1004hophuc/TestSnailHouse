import { Module } from '@nestjs/common';
import { idoNFTService } from './ido-nft.service';
import { idoNFTController } from './ido-nft.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IDONFT } from './ido-nft.entity';
import { IDONFTImage } from './ido-nft-image.entity';
import { idoNFTImageService } from './ido-nft-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([IDONFT, IDONFTImage])],
  controllers: [idoNFTController],
  providers: [idoNFTService, idoNFTImageService],
  exports: [idoNFTService, idoNFTImageService],
})
export class IdoNftModule {}
