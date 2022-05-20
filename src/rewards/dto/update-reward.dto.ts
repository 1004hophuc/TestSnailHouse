import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive, Max, Min } from 'class-validator';
import { getCurrentTime } from 'src/utils';
import { CreateRewardDto } from './create-reward.dto';

export class UpdateRewardDto extends PartialType(CreateRewardDto) {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  idoReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  swapReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  marketReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  nftLaunchpadReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  nftGameReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  seedInvestReward: number;

  @IsNotEmpty()
  @IsPositive()
  @Max(getCurrentTime())
  dateReward: number;
}
