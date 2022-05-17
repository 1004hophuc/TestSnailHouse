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
import { ProfitService } from './profit.service';
import { CreateProfitDto } from './dto/create-profit.dto';
import { UpdateProfitDto } from './dto/update-profit.dto';

@Controller('profit')
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Post()
  create(@Body() createProfitDto: CreateProfitDto) {
    return this.profitService.create(createProfitDto);
  }

  @Get('/calculate/:id')
  calculateProfit(@Param('id') id: string) {
    return this.profitService.calculateProfit(id);
  }

  @Get()
  findAll() {
    return this.profitService.findAll();
  }

  @Get('byTime')
  findOne(
    @Query('timestamp') timestamp: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.profitService.findOne(timestamp, page, limit);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfitDto: UpdateProfitDto) {
    return this.profitService.update(+id, updateProfitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profitService.remove(+id);
  }
}
