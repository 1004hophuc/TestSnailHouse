import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateUserAnswerDto {
  @IsOptional()
  @IsString()
  answerDescription?: string;

  @IsOptional()
  @IsArray()
  answerImages?: string[];

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  askId: string;

  @IsNotEmpty()
  @IsString()
  signature: string;
}
