import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Order } from 'src/common/dto/page-options.dto';
import { FindOneOptions, OrderByCondition } from 'typeorm';
import { NoticeType } from './create-notice.dto';

export enum FilterType {
  TITLE = 'title',
  CONTENT = 'content',
}

export class QueryDto {
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
  @IsEnum(FilterType, { message: `filterType must be 'title' or 'content'` })
  filterType?: FilterType;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsEnum(NoticeType)
  type?: NoticeType;

  @IsOptional()
  @IsEnum(Order)
  date?: Order;
}
