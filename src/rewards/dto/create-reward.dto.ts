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
  idoReward: number;

  // @IsNotEmpty()
  // @IsNumber()
  // @Min(0)
  // swapReward: number;

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

  // @IsNotEmpty()
  // @IsPositive()
  // @Max(getCurrentTime())
  // dateReward: number;
}
