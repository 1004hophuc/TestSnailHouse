import { PartialType } from '@nestjs/mapped-types';
import { CreateMailSubmitDto } from './create-mail-submit.dto';

export class UpdateMailSubmitDto extends PartialType(CreateMailSubmitDto) {}
