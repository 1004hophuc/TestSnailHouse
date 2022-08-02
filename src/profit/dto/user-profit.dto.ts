import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PROFIT_TYPE } from '../entities/profit.entity';

export class UserProfitDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(PROFIT_TYPE)
  type: PROFIT_TYPE;
}
