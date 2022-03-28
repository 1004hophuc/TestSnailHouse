import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

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
}
