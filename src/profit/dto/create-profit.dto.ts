import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProfitDto {
  @IsNotEmpty()
  @IsNumber()
  dateSendReward: number;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsNumber()
  amountProfit: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  dexProfit: number;

  @IsNotEmpty()
  @IsNumber()
  daoProfit: number;

  @IsNotEmpty()
  @IsNumber()
  dateReward: number;

  @IsNotEmpty()
  @IsNumber()
  totalDaoUser: number;

  @IsNotEmpty()
  @IsNumber()
  isWithdraw: number; // 0:false, 1:true
}
