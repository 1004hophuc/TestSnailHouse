import { IsNumber } from 'class-validator';

export class CreateProfitSentDto {
  @IsNumber()
  totalDaoUser: number;

  @IsNumber()
  dateSendReward: number;

  // per user
  @IsNumber()
  idoProfit: number;

  // per user
  @IsNumber()
  seedInvestProfit: number;

  // per user
  @IsNumber()
  marketProfit: number;

  // per user
  @IsNumber()
  nftLaunchpadProfit: number;

  // per user
  @IsNumber()
  nftGameProfit: number;
}
