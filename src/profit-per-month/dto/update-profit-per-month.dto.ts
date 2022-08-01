import { PartialType } from '@nestjs/mapped-types';
import { CreateProfitPerMonthDto } from './create-profit-per-month.dto';

export class UpdateProfitPerMonthDto extends PartialType(CreateProfitPerMonthDto) {}
