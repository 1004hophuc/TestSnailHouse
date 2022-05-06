import { IsOptional, IsAlphanumeric } from 'class-validator';

export class QueryHistoryDto {
  @IsAlphanumeric()
  @IsOptional()
  limit?: string;

  @IsAlphanumeric()
  @IsOptional()
  page?: number;

  @IsOptional()
  address: string;

  @IsOptional()
  status: string;
}
