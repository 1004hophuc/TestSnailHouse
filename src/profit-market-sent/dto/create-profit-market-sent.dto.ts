import { IsNumber, IsString } from 'class-validator';

export class CreateProfitMarketSentDto {
  @IsNumber()
  totalDaoUser: number;

  @IsNumber()
  dateSendReward: number;

  // per user
  @IsNumber()
  marketProfit: number;
}
