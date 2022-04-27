import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNumber()
  amount: number;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  txHash: string;

  @IsBoolean()
  @IsOptional()
  isMarket = false;

  @IsNumber()
  @IsOptional()
  level = 1;

  @IsBoolean()
  @IsOptional()
  isOwnerCreated = false;

  @IsNumber()
  @IsOptional()
  launchpadId = 0;

  @IsNumber()
  @IsOptional()
  tokenId;
}