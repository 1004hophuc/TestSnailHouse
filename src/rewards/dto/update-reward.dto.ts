import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { getCurrentTime } from 'src/utils';
import { CreateRewardDto } from './create-reward.dto';

export class UpdateRewardDto extends PartialType(CreateRewardDto) {}
