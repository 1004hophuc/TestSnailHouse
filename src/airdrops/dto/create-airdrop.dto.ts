import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { getCurrentStartOfDate, getCurrentTime } from 'src/utils';
import { IsBiggerThan } from 'src/validators/isBiggerThan';

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
  @IsEnum(AirdropType)
  type: AirdropType;

  @IsNotEmpty()
  @IsNumber()
  amountPerUser: number;

  @IsNotEmpty()
  @IsInt()
  @Min(getCurrentStartOfDate())
  dateStart: number;

  @IsNotEmpty()
  @IsInt()
  @IsBiggerThan('dateStart', {
    message: 'dateEnd must be larger than dateStart',
  })
  dateEnd: number;
}
