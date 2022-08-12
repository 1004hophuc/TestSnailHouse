import { PartialType } from '@nestjs/mapped-types';
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
import { CreateRewardDto } from './create-reward.dto';

export class UpdateRewardDto extends PartialType(CreateRewardDto) {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  idoReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  idoPercent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  nftLaunchpadReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  nftLaunchpadPercent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  nftGameReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  nftGamePercent: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  seedInvestReward: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  seedInvestPercent: number;
}
