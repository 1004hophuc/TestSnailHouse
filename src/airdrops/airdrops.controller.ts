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
import { AirdropsService } from './airdrops.service';
import { CreateAirdropDto } from './dto/create-airdrop.dto';
import { UpdateAirdropDto } from './dto/update-airdrop.dto';

@Controller('airdrops')
export class AirdropsController {
  constructor(private readonly airdropsService: AirdropsService) {}

  @Post()
  create(@Body() createAirdropDto: CreateAirdropDto) {
    return this.airdropsService.create(createAirdropDto);
  }

  @Get()
  findAll() {
    return this.airdropsService.findAll();
  }

  @Get('pagination')
  getPaginateAirdrops(
    @Query('page') page: number,
    @Query('limit') limit: number
  ) {
    return this.airdropsService.getPaginateAirdrops(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.airdropsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAirdropDto: UpdateAirdropDto) {
    return this.airdropsService.update(id, updateAirdropDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airdropsService.remove(id);
  }
}
