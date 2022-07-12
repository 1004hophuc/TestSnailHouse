import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { IDONFTImage } from './ido-nft-image.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { getWeb3 } from '../utils/web3';

import { Abi as NFTAbi } from '../contract/NFT';
import BBPromise from 'bluebird';

import { QueryIDONFTImageDto } from './dto/query-nft-image.dto';

interface QueryImage {
  level: number;
  isSold?: boolean;
}

@Injectable()
export class idoNFTImageService {
  constructor(
    @InjectRepository(IDONFTImage)
    private idoNFTImageRepository: Repository<IDONFTImage>
  ) {}

  async getByLevel(query: QueryIDONFTImageDto): Promise<any> {
    const { page = 1, limit = 10000, level = 1, isSold } = query;

    const queryWhere: QueryImage = { level: +level };
    if (isSold == 0 || isSold == 1) {
      queryWhere.isSold = !!isSold;
    }

    const [data, count] = await this.idoNFTImageRepository.findAndCount({
      where: queryWhere,
      order: { imageId: 1 },
      skip: +(page - 1) * +limit,
      take: +limit,
    });
    return { data, count };
  }

  async getDetailImage(imageId: number): Promise<any> {
    const data = await this.idoNFTImageRepository.findOne({
      imageId: +imageId,
    });

    return data;
  }

  async initData(data: Array<any>, key: string): Promise<boolean> {
    try {
      if (key != 'WeAreFamilymartketWinery') {
        return;
      }

      await BBPromise.map(data, async (item) => {
        await this.idoNFTImageRepository.insert({ ...item, isSold: false });
      });

      return true;
    } catch (e) {
      console.log('init data err: ', e);
    }
  }

  async updateStatusImage(imageId, isSold: boolean): Promise<boolean> {
    try {
      if (imageId == undefined || imageId == null) return false;

      await this.idoNFTImageRepository.update({ imageId }, { isSold });

      return true;
    } catch (e) {
      console.log('init data err: ', e);
      return false;
    }
  }
}
