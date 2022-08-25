import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateNoticeDto, NoticeType } from './dto/create-notice.dto';
import { QueryDto } from './dto/query-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NoticeService } from './notice.service';

@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticeService.create(createNoticeDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryDto) {
    return this.noticeService.findAll(queryDto);
  }

  @Get('all-type')
  findEveryType() {
    return this.noticeService.findEveryType();
  }

  @Get('with-type')
  findWithType(@Query('type') type: NoticeType) {
    return this.noticeService.findWithType(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeService.update(+id, updateNoticeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noticeService.remove(id);
  }
}
