import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProfitDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsNumber()
  amountProfit: number;

  @IsNotEmpty()
  @IsString()
  weiAmountProfit: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  dexProfit: number;


}
