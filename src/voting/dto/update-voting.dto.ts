import { PartialType } from '@nestjs/mapped-types';
import { CreateVotingDto } from './create-voting.dto';

export class UpdateVotingDto extends PartialType(CreateVotingDto) {}
