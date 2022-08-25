import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAskDto } from './create-user-ask.dto';

export class UpdateUserAskDto extends PartialType(CreateUserAskDto) {}
