import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProfitSentDto {
  @IsNumber()
  totalDaoUser: number;

  @IsNumber()
  dateSendReward: number;

  // per user
  @IsNumber()
  idoProfit: number;

  @IsNumber()
  idoPercent: number;

  // per user
  @IsNumber()
  seedInvestProfit: number;

  @IsNumber()
  seedInvestPercent: number;

  // per user
  @IsNumber()
  nftLaunchpadProfit: number;

  @IsNumber()
  nftLaunchpadPercent: number;

  // per user
  @IsNumber()
  nftGameProfit: number;

  @IsNumber()
  nftGamePercent: number;
}
