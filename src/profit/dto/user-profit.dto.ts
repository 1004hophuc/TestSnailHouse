import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserProfitDto {
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  dateReward?: number;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}
