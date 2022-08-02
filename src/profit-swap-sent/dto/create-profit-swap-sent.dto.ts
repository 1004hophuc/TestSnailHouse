import { IsNumber, IsString } from 'class-validator';

export class CreateProfitSwapSentDto {
  @IsNumber()
  totalDaoUser: number;

  @IsNumber()
  dateSendReward: number;

  // per user
  @IsNumber()
  swapProfit: number;
}
