import { PartialType } from '@nestjs/mapped-types';
import { CreateProfitSentDto } from './create-profit-sent.dto';

export class UpdateProfitSentDto extends PartialType(CreateProfitSentDto) {}
