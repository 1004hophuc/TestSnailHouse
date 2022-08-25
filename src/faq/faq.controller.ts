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
import { CreateUserAnswerDto } from 'src/user-answer/dto/create-user-answer.dto';
import { UserAnswerService } from 'src/user-answer/user-answer.service';
import { CreateUserAskDto } from 'src/user-ask/dto/create-user-ask.dto';
import { UserAskService } from 'src/user-ask/user-ask.service';
import { CreateBulkFaqDto, CreateFaqDto, FaqType } from './dto/create-faq.dto';
import { QueryFaqDto } from './dto/query-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqService } from './faq.service';

@Controller('faq')
export class FaqController {
  constructor(
    private readonly faqService: FaqService,
    private readonly userAskService: UserAskService,
    private readonly userAnswerService: UserAnswerService
  ) {}

  @Post()
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Post('bulk')
  createBulk(@Body() createBulkFaqDto: CreateBulkFaqDto) {
    return this.faqService.createBulk(createBulkFaqDto);
  }

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Get('with-type')
  getWithType(@Query() queryDto: QueryFaqDto) {
    return this.faqService.getWithType(queryDto);
  }

  @Get('/delete/:id')
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }

  @Post('/update/:id')
  update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
    return this.faqService.update(id, updateFaqDto);
  }

  @Get('ask')
  getAllUserAsk(@Query() queryAsk: QueryFaqDto) {
    return this.faqService.getAllAsks(queryAsk);
  }

  @Get('ask/:id')
  getUserAsk(@Param('id') id: string) {
    return this.faqService.getUserAsk(id);
  }

  @Post('create-ask')
  postUserAsk(@Body() createUserAskDto: CreateUserAskDto) {
    return this.userAskService.create(createUserAskDto);
  }

  @Post('create-answer')
  postUserAns(@Body() createUserAnswerDto: CreateUserAnswerDto) {
    return this.userAnswerService.create(createUserAnswerDto);
  }
}
