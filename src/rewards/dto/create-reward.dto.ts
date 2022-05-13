import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRewardDto {
  @IsNotEmpty()
  @IsNumber()
  idoReward: number;

  @IsNotEmpty()
  @IsNumber()
  swapReward: number;

  @IsNotEmpty()
  @IsNumber()
  marketReward: number;
}
