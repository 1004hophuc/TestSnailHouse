import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { getCurrentTime } from 'src/utils';

export enum AirdropType {
  ALL = 'all',
  SOCIALNETWORK = 'social',
  NFT = 'nft',
  P2E = 'p2e',
  AIRDROP = 'airdrop',
  RANDOM = 'random',
  COMPLETETASK = 'completetask',
  REGISTRATION = 'registration',
}

export class CreateAirdropDto {
  @IsNotEmpty()
  @IsString()
  tokenAddress: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  tokenName: string;

  @IsNotEmpty()
  @IsString()
  type: AirdropType;

  @IsNotEmpty()
  @IsNumber()
  amountPerUser: number;

  @IsNotEmpty()
  @IsPositive()
  dateStart: number;

  @IsNotEmpty()
  @IsPositive()
  @Min(getCurrentTime())
  dateEnd: number;
}
