import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { NFT } from './nft.entity';
import { NFTImage } from './nft-image.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { getWeb3 } from '../utils/web3';

import { Abi as NFTAbi } from '../contract/NFT';

import { NftImageService } from './nft-image.service';

interface Metadata {
  tokenId: number;
  tokenOwner: string;
  level: number;
  id: any;
}

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,

    private readonly nftImageService: NftImageService,
  ) {}

  async getMetadata(id: string): Promise<any> {
    const data = await this.nftRepository.findOne({ tokenId: +id });
    if (data) {
      delete data.id;
      return data;
    }
    const newData = await this.createMetadata(id);

    delete newData.id;

    return newData;
  }

  async createMetadata(id: string, imageId?: number): Promise<Metadata> {
    try {
      const web3 = getWeb3();

      const contract = new web3.eth.Contract(
        NFTAbi as any,
        process.env.CONTRACT_NFT,
      );

      const tokenInfo = await contract.methods.getToken(+id).call();

      let chooseImage: any = {};

      // Xử lý dataImage
      if (imageId) {
        const image = await this.nftImageService.getDetailImage(+imageId);
        if (!image.isSold) {
          chooseImage = image;
        } else {
          chooseImage = await this.getRandomImageNotSold(+tokenInfo?.level);
        }
      } else {
        chooseImage = await this.getRandomImageNotSold(+tokenInfo?.level);
      }

      const item = await this.nftRepository.create({
        tokenId: +id,
        tokenOwner: tokenInfo.tokenOwner,
        level: +tokenInfo.level,
        image: chooseImage?.image,
        name: tokenInfo.name,
        description: tokenInfo.description,
      });

      const [newData] = await Promise.all([
        this.nftRepository.save(item),
        this.nftImageService.updateStatusImage(chooseImage?.imageId, true),
      ]);

      return newData;
    } catch (e) {
      console.log('createMetadata: ', e);
    }
  }

  async getRandomImageNotSold(level: number) {
    const listImage = await this.nftImageService.getByLevel({
      level: +level,
      isSold: 0,
    });

    return listImage.data[0];
  }
}
