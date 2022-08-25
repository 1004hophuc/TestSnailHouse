import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { FaqType } from './create-faq.dto';

export class QueryFaqDto {
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
  @IsEnum(FaqType)
  type?: FaqType;

  @IsOptional()
  @IsString()
  filter?: string;
}
