import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { AirdropType } from './create-airdrop.dto';

export class QueryDto {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  type?: AirdropType;
}
