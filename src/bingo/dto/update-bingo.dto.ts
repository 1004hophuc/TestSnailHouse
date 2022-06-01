import { PartialType } from '@nestjs/mapped-types';
import { CreateBingoDto } from './create-bingo.dto';

export class UpdateBingoDto extends PartialType(CreateBingoDto) {}
