import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfitPerMonthService } from './profit-per-month.service';
import { CreateProfitPerMonthDto } from './dto/create-profit-per-month.dto';
import { UpdateProfitPerMonthDto } from './dto/update-profit-per-month.dto';

@Controller('profit-per-month')
export class ProfitPerMonthController {
  constructor(private readonly profitPerMonthService: ProfitPerMonthService) {}

  @Post()
  create(@Body() createProfitPerMonthDto: CreateProfitPerMonthDto) {
    return this.profitPerMonthService.create(createProfitPerMonthDto);
  }

  @Get()
  findAll() {
    return this.profitPerMonthService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profitPerMonthService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfitPerMonthDto: UpdateProfitPerMonthDto) {
    return this.profitPerMonthService.update(+id, updateProfitPerMonthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profitPerMonthService.remove(+id);
  }
}
