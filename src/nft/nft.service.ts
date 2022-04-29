import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { NFT } from './nft.entity';
import { NFTImage } from './nft-image.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { getWeb3 } from '../utils/web3';

import { Abi as NFTAbi } from '../contract/NFT';

import { NftImageService } from './nft-image.service';

const levelNameMapping = (level) => {
  switch (+level) {
    case 1:
      return 'Cheese';
    case 2:
      return 'Opener';
    case 3:
      return 'Wine Glass';

    case 4:
      return 'Wine Oak';

    case 5:
      return 'Romanée Conti';

    default:
      break;
  }
};

const levelDescriptionMapping = (level) => {
  switch (+level) {
    case 1:
      return `The color of the background is inspired by the label of Jonnie Walker Whisky. Cheese NFT is presented for a specialist who knows exactly what is mixed with wine will make your taste explode`;
    case 2:
      return 'The color of the background is inspired by the label of Jonnie Walker Whisky. NFT Opener is presented for a wine taster who knows all about wine all over the world but gives you a taste of just what the doctor ordered';
    case 3:
      return 'The color of the background is inspired by the label of Jonnie Walker Whisky. NFT Wine Glass is presented for a wine lover who knows which kinds of wine will match your emotion, be a sense friend whenever you need';

    case 4:
      return 'The color of the background is inspired by the label of Jonnie Walker Whisky. NFT Wine Oak is presented for a cellar owner who gives all kindness to wine and makes them become their best status ever';

    case 5:
      return 'The color of the background is inspired by the label of Jonnie Walker Whisky. NFT Romanée Conti is presented for a wine collector who is touched by wine and understands how wine is worth, collect them by all means';

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
export class NftService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,

    private readonly nftImageService: NftImageService,
  ) {}

  async getMetadata(id: string): Promise<any> {
    try {
      const data = await this.nftRepository.findOne({ tokenId: +id });
      if (data) {
        data.name = levelNameMapping(data.level);
        data.description = levelDescriptionMapping(data.level);

        delete data.id;
        return data;
      }
      const newData = await this.createMetadata(id);

      delete newData.id;

      newData.name = levelNameMapping(newData.level);
      newData.description = levelDescriptionMapping(newData.level);

      return newData;
    } catch (e) {
      return {};
    }
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
