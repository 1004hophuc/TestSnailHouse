import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { getCurrentTime } from 'src/utils';

export class CreateAirdropDto {
  @IsNotEmpty()
  @IsString()
  tokenAddress: string;

  @IsNotEmpty()
  @IsString()
  tokenName: string;

  @IsNotEmpty()
  @IsNumber()
  amountPerUser: number;

  @IsNotEmpty()
  @IsPositive()
  dateStart: number;

  @IsNotEmpty()
  @IsPositive()
  @Min(getCurrentTime())
  dateEnd: number;
}
