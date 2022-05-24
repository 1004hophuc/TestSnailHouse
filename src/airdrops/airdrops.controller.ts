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
import { QueryDto } from './dto/query-airdrop.dto';
import { SignMessageDto } from './dto/sign-message.dto';
import { UpdateAirdropDto } from './dto/update-airdrop.dto';

@Controller('airdrops')
export class AirdropsController {
  constructor(private readonly airdropsService: AirdropsService) {}

  // Api for frontend
  @Get('by-type')
  getAirdropsByType(@Query() query: QueryDto) {
    const { account, page, limit, type } = query;
    const lowercaseAccount = account.toLowerCase();

    return this.airdropsService.getAirdropsByType(
      page,
      limit,
      type,
      lowercaseAccount
    );
  }

  @Get('quantity-airdrop')
  getQuantityAirdropType(@Query() query: QueryDto) {
    const lowercaseAccount = query.account.toLowerCase();
    return this.airdropsService.getQuantityAirdropType(lowercaseAccount);
  }

  @Post('sign-message')
  signAirdropMessage(@Body() signMessageDto: SignMessageDto) {
    return this.airdropsService.signAirdropMessage(signMessageDto);
  }

  // Api for cms
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
