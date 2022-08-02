import { PartialType } from '@nestjs/mapped-types';
import { CreateProfitSwapSentDto } from './create-profit-swap-sent.dto';

export class UpdateProfitSwapSentDto extends PartialType(CreateProfitSwapSentDto) {}
