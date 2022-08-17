import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProfitSentDto {
  @IsNumber()
  daoUntilTime: number;

  @IsNumber()
  totalDaoUser: number;

  @IsNumber()
  dateSendReward: number;

  @IsNumber()
  idoProfit: number;

  @IsNumber()
  idoPercent: number;

  @IsNumber()
  seedInvestProfit: number;

  @IsNumber()
  seedInvestPercent: number;

  @IsNumber()
  nftLaunchpadProfit: number;

  @IsNumber()
  nftLaunchpadPercent: number;

  @IsNumber()
  nftGameProfit: number;

  @IsNumber()
  nftGamePercent: number;

  @IsNumber()
  swapProfit: number;

  @IsNumber()
  marketProfit: number;
}
