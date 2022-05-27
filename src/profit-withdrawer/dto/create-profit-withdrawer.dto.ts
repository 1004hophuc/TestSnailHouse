import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';

export enum WithdrawStatus {
  PENDING = 'pending',
  FINISH = 'finish',
}

export class CreateProfitWithdrawerDto {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsNumber()
  amountWithdraw: number;

  @IsNotEmpty()
  @IsString()
  amountWeiWithdraw: string;

  @IsNotEmpty()
  @IsNumber()
  dateWithdraw: number;

  @IsNotEmpty()
  @IsEnum(PROFIT_TYPE)
  type: PROFIT_TYPE;

  @IsNotEmpty()
  @IsString()
  txHash: string;

  @IsOptional()
  @IsEnum(WithdrawStatus)
  status?: WithdrawStatus;
}
