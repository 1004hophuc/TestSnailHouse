import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { NFTImage } from './nft-image.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { getWeb3 } from '../utils/web3';

import { Abi as NFTAbi } from '../contract/NFT';

import { QueryNFTImageDto } from './dto/query-nft-image.dto';

interface QueryImage {
  level: number;
  isSold?: boolean;
}

@Injectable()
export class NftImageService {
  constructor(
    @InjectRepository(NFTImage)
    private nftImageRepository: Repository<NFTImage>,
  ) {}

  async getByLevel(query: QueryNFTImageDto): Promise<any> {
    const { page = 1, limit = 10000, level, isSold } = query;

    const queryWhere: QueryImage = { level: +level };
    if (isSold == 0 || isSold == 1) {
      queryWhere.isSold = !!isSold;
    }

    const [data, count] = await this.nftImageRepository.findAndCount({
      where: queryWhere,
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async getDetailImage(imageId: number): Promise<any> {
    const data = await this.nftImageRepository.findOne({
      imageId: +imageId,
    });

    return data;
  }

  async initData(data: Array<any>, key: string): Promise<boolean> {
    try {
      if (key != 'WeAreFamilymartketWinery')
        await this.nftImageRepository.delete({});

      for (const item of data) {
        await this.nftImageRepository.insert({ ...item, isSold: false });
      }
      return true;
    } catch (e) {
      console.log('init data err: ', e);
    }
  }

  async updateStatusImage(imageId, isSold: boolean): Promise<boolean> {
    try {
      if (!imageId) return false;

      await this.nftImageRepository.update({ imageId }, { isSold });

      return true;
    } catch (e) {
      console.log('init data err: ', e);
      return false;
    }
  }
}
