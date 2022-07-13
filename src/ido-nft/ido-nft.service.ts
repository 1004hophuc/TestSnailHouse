import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { IDONFT } from './ido-nft.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { getWeb3 } from '../utils/web3';

import { Abi as IDONFTAbi } from '../contract/IDO-NFT';

import { idoNFTImageService } from './ido-nft-image.service';

const idoLaunchPadNameMapping = (index) => {
  switch (+index) {
    case 0:
      return 'Chocolate';
    case 1:
      return 'White';
    default:
      break;
  }
};

const idoLaunchPadDescriptionMapping = (index) => {
  switch (+index) {
    case 0:
      return `By purchasing an NFT IDO card, you can participate in hundreds of IDO projects on Winery DAO. This is a perfect opportunity to be on the whitelist of new potential projects in the easiest way possible. Take advantage of this chance by purchasing NFT IDO right now!`;

    case 1:
      return `By purchasing an NFT IDO card, you can participate in hundreds of IDO projects on Winery DAO. This is a perfect opportunity to be on the whitelist of new potential projects in the easiest way possible. Take advantage of this chance by purchasing NFT IDO right now!`;

    default:
      break;
  }
};

const idoLaunchPadImageUriMapping = (index) => {
  switch (+index) {
    case 0:
      return 'https://nftmarket.winerydao.day/upload/DAO_0.png';

    case 1:
      return 'https://nftmarket.winerydao.day/upload/NFTCARD_WHITE.png';
    default:
      break;
  }
};

interface Metadata {
  tokenId: number;
  tokenOwner: string;
  level: number;
  id: any;
  name?: string;
  description?: string;
}

@Injectable()
export class idoNFTService {
  constructor(
    @InjectRepository(IDONFT)
    private idoNFTRepository: Repository<IDONFT>,

    private readonly idoNFTImageService: idoNFTImageService
  ) {}

  async getMetadata(id: string): Promise<any> {
    try {
      const data = await this.idoNFTRepository.findOne({ tokenId: +id });

      if (data) {
        data.name = idoLaunchPadNameMapping(data.level);
        data.description = idoLaunchPadDescriptionMapping(data.level);

        delete data.id;
        return data;
      }
      const newData = await this.createMetadata(id, data.launchpad_index);

      delete newData.id;

      newData.name = idoLaunchPadNameMapping(newData.level);
      newData.description = idoLaunchPadDescriptionMapping(newData.level);

      return newData;
    } catch (e) {
      return {};
    }
  }

  async createMetadata(
    id: string,
    launchpadIndex: number,
    imageId?: number
  ): Promise<Metadata> {
    try {
      const web3 = getWeb3();

      const contract = new web3.eth.Contract(
        IDONFTAbi as any,
        process.env.CONTRACT_IDO_NFT
      );

      const tokenInfo = await contract.methods.getToken(+id).call();

      const item = await this.idoNFTRepository.create({
        tokenId: +id,
        tokenOwner: tokenInfo.tokenOwner,
        level: +tokenInfo.level,
        image: idoLaunchPadImageUriMapping(launchpadIndex),
        name: tokenInfo.name,
        description: tokenInfo.description,
        launchpad_index: launchpadIndex,
      });

      const [newData] = await Promise.all([this.idoNFTRepository.save(item)]);

      return newData;
    } catch (e) {
      console.log('createMetadata: ', e);
    }
  }

  async getRandomImageNotSold(level: number) {
    const listImage = await this.idoNFTImageService.getByLevel({
      level: +level,
      isSold: 0,
    });

    return listImage.data[0];
  }
}
