import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { getCurrentTime } from 'src/utils';

export class CreateRewardDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(getCurrentTime())
  daoUntilTime: number; // from this time back to previous, get all the DAO User available to calculate

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  idoReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  idoPercent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  nftLaunchpadReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  nftLaunchpadPercent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  nftGameReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  nftGamePercent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  seedInvestReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  seedInvestPercent: number;
}
