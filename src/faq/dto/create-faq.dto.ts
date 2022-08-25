import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum FaqType {
  DAO = 'DAO',
  IDO = 'IDO',
  AIRDROP = 'Airdrop',
  MARKET = 'NFT Market',
  VOTE = 'Vote',
  DASHBOARD = 'Dashboard',
}

export class CreateFaqDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(FaqType)
  type: FaqType;
}

export class CreateBulkFaqDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateFaqDto)
  faqs: CreateFaqDto[];
}
