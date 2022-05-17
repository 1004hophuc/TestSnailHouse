import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateRewardDto } from './create-reward.dto';

export class UpdateRewardDto extends PartialType(CreateRewardDto) {
  @IsNotEmpty()
  @IsNumber()
  idoReward: number;

  @IsNotEmpty()
  @IsNumber()
  swapReward: number;

  @IsNotEmpty()
  @IsNumber()
  marketReward: number;

  @IsNotEmpty()
  @IsNumber()
  dateReward: number;
}
