import { IsOptional, IsAlphanumeric } from 'class-validator';

export class QueryIDONFTImageDto {
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
