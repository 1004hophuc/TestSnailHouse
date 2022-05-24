import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MailSubmitService } from './mail-submit.service';
import { CreateMailSubmitDto } from './dto/create-mail-submit.dto';
import { UpdateMailSubmitDto } from './dto/update-mail-submit.dto';

@Controller('mail-submit')
export class MailSubmitController {
  constructor(private readonly mailSubmitService: MailSubmitService) {}

  @Post()
  mailSubmit(@Body() createMailSubmitDto: CreateMailSubmitDto) {
    return this.mailSubmitService.mailSubmit(createMailSubmitDto);
  }

  @Get()
  findAll() {
    return this.mailSubmitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mailSubmitService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMailSubmitDto: UpdateMailSubmitDto
  ) {
    return this.mailSubmitService.update(+id, updateMailSubmitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mailSubmitService.remove(+id);
  }
}
