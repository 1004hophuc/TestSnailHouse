import { PartialType } from '@nestjs/mapped-types';
import { CreateProfitMarketSentDto } from './create-profit-market-sent.dto';

export class UpdateProfitMarketSentDto extends PartialType(
  CreateProfitMarketSentDto
) {}
