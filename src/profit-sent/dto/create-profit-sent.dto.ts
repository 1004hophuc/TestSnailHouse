import { IsNumber } from 'class-validator';

export class CreateProfitSentDto {
  @IsNumber()
  totalDaoUser: number;

  @IsNumber()
  dateSendReward: number;

  @IsNumber()
  idoProfit: number;

  @IsNumber()
  seedInvestProfit: number;

  @IsNumber()
  marketProfit: number;

  @IsNumber()
  nftLaunchpadProfit: number;

  @IsNumber()
  nftGameProfit: number;

  @IsNumber()
  swapProfit: number;
}
