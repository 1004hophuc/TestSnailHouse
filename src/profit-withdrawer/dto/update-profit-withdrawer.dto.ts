import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';

export class UpdateProfitWithdrawerDto {
  @IsNotEmpty()
  @IsString()
  account: string;

  @IsNotEmpty()
  @IsEnum(PROFIT_TYPE)
  type: PROFIT_TYPE;

  @IsNotEmpty()
  @IsString()
  txHash: string;
}
