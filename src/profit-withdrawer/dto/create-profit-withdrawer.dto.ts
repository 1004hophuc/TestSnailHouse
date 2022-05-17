import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateProfitWithdrawerDto {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsNumber()
  amountWithdraw: number;

  @IsNotEmpty()
  @IsNumber()
  dateWithdraw: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  txHash: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
