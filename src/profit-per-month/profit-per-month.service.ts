import { Injectable } from '@nestjs/common';
import { CreateProfitPerMonthDto } from './dto/create-profit-per-month.dto';
import { UpdateProfitPerMonthDto } from './dto/update-profit-per-month.dto';

@Injectable()
export class ProfitPerMonthService {
  create(createProfitPerMonthDto: CreateProfitPerMonthDto) {
    return 'This action adds a new profitPerMonth';
  }

  findAll() {
    return `This action returns all profitPerMonth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profitPerMonth`;
  }

  update(id: number, updateProfitPerMonthDto: UpdateProfitPerMonthDto) {
    return `This action updates a #${id} profitPerMonth`;
  }

  remove(id: number) {
    return `This action removes a #${id} profitPerMonth`;
  }
}
