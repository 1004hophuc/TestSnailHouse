import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ObjectID } from 'typeorm';

export class SignMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  airdropId: ObjectID;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  tokenAddress: string;
}
