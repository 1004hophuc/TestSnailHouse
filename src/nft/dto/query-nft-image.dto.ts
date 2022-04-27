import { IsOptional, IsAlphanumeric } from 'class-validator';

export class QueryNFTImageDto {
  @IsAlphanumeric()
  @IsOptional()
  limit?: string;

  @IsAlphanumeric()
  @IsOptional()
  page?: number;

  @IsAlphanumeric()
  @IsOptional()
  level?: number;

  @IsOptional()
  isSold?: number;
}
