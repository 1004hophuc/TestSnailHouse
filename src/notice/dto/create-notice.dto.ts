import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export enum NoticeType {
  NOTICE = 'notice',
  VERSION = 'version',
  EVENT = 'event',
}

export class CreateNoticeDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(NoticeType)
  type: NoticeType;
}
