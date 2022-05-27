import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;
}
