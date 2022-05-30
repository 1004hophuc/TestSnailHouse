import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { getCurrentHourDate } from 'src/utils';
import { IsBiggerThan } from 'src/validators/isBiggerThan';

export enum VoteType {
  TECH = 'tech',
  NON_TECH = 'non-tech',
}

export class CreateVotingDto {
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  @Type(() => OptionProperty)
  options: OptionProperty[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(VoteType)
  type: VoteType;

  @IsNotEmpty()
  @IsNumber()
  dateSubmit: number;

  @IsNotEmpty()
  @IsInt()
  @Min(getCurrentHourDate())
  dateStart: number;

  @IsNotEmpty()
  @IsInt()
  @IsBiggerThan('dateStart', {
    message: 'dateEnd must be larger than dateStart',
  })
  dateEnd: number;
}

export class OptionProperty {
  @IsNotEmpty()
  @IsString()
  value: string;
}
