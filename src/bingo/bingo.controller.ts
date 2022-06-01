import { SignDto } from './dto/sign.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BingoService } from './bingo.service';
import { CreateBingoDto } from './dto/create-bingo.dto';
import { UpdateBingoDto } from './dto/update-bingo.dto';

@Controller('bingo')
export class BingoController {
  constructor(private readonly bingoService: BingoService) { }

  @Post('/deposit/pending')
  create(@Body() createBingoDto: CreateBingoDto) {
    return this.bingoService.createDeposit(createBingoDto);
  }

  @Post('/deposit/complete')
  update(@Body() createBingoDto: CreateBingoDto) {
    return this.bingoService.completeDeposit(createBingoDto);
  }

  @Post('/withdraw/pending')
  createWithdraw(@Body() createBingoDto: CreateBingoDto) {
    return this.bingoService.createWithdraw(createBingoDto);
  }

  @Post('/withdraw/sign')
  signWithdraw(@Body() signData: SignDto) {
    return this.bingoService.signWithdraw(signData);
  }

  @Post('/withdraw/complete')
  updateWithdraw(@Body() createBingoDto: CreateBingoDto) {
    return this.bingoService.completeWithdraw(createBingoDto);
  }

  @Get('/:address')
  findOne(@Param('address') address: string) {
    if (!address) {
      return { msg: "address is required", code: 400 };
    }

    return this.bingoService.findOne(address);
  }



}
