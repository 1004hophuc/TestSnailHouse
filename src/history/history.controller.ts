import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { QueryHistoryDto } from './dto/query-history.dto';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Get()
  async findAll(@Query() query: QueryHistoryDto) {
    return { status: 200, data: await this.historyService.findAll(query) };
  }

  @Get('/total-withdraw')
  findTotalWithdraw(@Query('address') address: string) {
    return this.historyService.totalWithdraw(address);
  }

  @Get('/sign')
  signMessage(@Query('address') address: string) {
    return this.historyService.signMessage(address);
  }

  @Get('/is-pending')
  checkPending(@Query('address') address: string) {
    return this.historyService.checkPendingUser(address);
  }
}
