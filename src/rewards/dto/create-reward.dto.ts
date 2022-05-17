import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateRewardDto {
  @IsNotEmpty()
  @IsPositive()
  idoReward: number;

  @IsNotEmpty()
  @IsPositive()
  swapReward: number;

  @IsNotEmpty()
  @IsPositive()
  marketReward: number;

  @IsNotEmpty()
  @IsPositive()
  dateReward: number;
}
