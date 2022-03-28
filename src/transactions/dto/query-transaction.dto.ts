import { IsNumber, IsOptional, IsAlphanumeric } from 'class-validator';

export class QueryTransactionDto {
  @IsAlphanumeric()
  @IsOptional()
  limit?: string;

  @IsAlphanumeric()
  @IsOptional()
  page?: number;
}
