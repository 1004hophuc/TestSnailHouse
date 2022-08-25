import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateUserAskDto {
  @IsOptional()
  @IsString()
  askDescription?: string;

  @IsOptional()
  @IsArray()
  askImages?: string[];

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  signature: string;
}
