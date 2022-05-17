import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProfitWithdrawerService } from './profit-withdrawer.service';
import { CreateProfitWithdrawerDto } from './dto/create-profit-withdrawer.dto';
import { UpdateProfitWithdrawerDto } from './dto/update-profit-withdrawer.dto';

@Controller('profit-withdrawer')
export class ProfitWithdrawerController {
  constructor(
    private readonly profitWithdrawerService: ProfitWithdrawerService
  ) {}

  @Post()
  create(@Body() createProfitWithdrawerDto: CreateProfitWithdrawerDto) {
    return this.profitWithdrawerService.create(createProfitWithdrawerDto);
  }

  @Get()
  findAll() {
    return this.profitWithdrawerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profitWithdrawerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfitWithdrawerDto: UpdateProfitWithdrawerDto
  ) {
    return this.profitWithdrawerService.update(+id, updateProfitWithdrawerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profitWithdrawerService.remove(+id);
  }
}
