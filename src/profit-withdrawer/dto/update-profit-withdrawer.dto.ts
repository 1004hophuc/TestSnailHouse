import { PartialType } from '@nestjs/mapped-types';
import { CreateProfitWithdrawerDto } from './create-profit-withdrawer.dto';

export class UpdateProfitWithdrawerDto extends PartialType(CreateProfitWithdrawerDto) {}
