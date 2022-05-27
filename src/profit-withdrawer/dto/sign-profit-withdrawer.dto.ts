import {
  IsEnum,
  IsNotEmpty,
  IsInt,
  IsString,
  IsPositive,
} from 'class-validator';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';

export class SignProfitDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsEnum(PROFIT_TYPE)
  type: PROFIT_TYPE;
}
