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
import { ProfitWithdrawerService } from './profit-withdrawer.service';
import { CreateProfitWithdrawerDto } from './dto/create-profit-withdrawer.dto';
import { UpdateProfitWithdrawerDto } from './dto/update-profit-withdrawer.dto';
import { SignProfitDto } from './dto/sign-profit-withdrawer.dto';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';

@Controller('profit-withdrawer')
export class ProfitWithdrawerController {
  constructor(
    private readonly profitWithdrawerService: ProfitWithdrawerService
  ) {}

  @Post()
  create(@Body() createProfitWithdrawerDto: CreateProfitWithdrawerDto) {
    const { account } = createProfitWithdrawerDto;
    createProfitWithdrawerDto.account = account.toLowerCase();
    return this.profitWithdrawerService.create(createProfitWithdrawerDto);
  }

  @Post('update-status')
  updateWithdrawStatus(@Body() updateStatusDto: UpdateProfitWithdrawerDto) {
    const { account } = updateStatusDto;
    updateStatusDto.account = account.toLowerCase();
    return this.profitWithdrawerService.updateWithdrawStatus(updateStatusDto);
  }

  @Post('sign-message')
  signMessage(@Body() signProfitWithdraweDto: SignProfitDto) {
    const { user } = signProfitWithdraweDto;
    signProfitWithdraweDto.user = user.toLowerCase();
    return this.profitWithdrawerService.signWithdrawMessage(
      signProfitWithdraweDto
    );
  }

  @Get()
  findAll(@Query('account') account: string, @Query('type') type: PROFIT_TYPE) {
    return this.profitWithdrawerService.findAll(account.toLowerCase(), type);
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
