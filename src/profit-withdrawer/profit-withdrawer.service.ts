import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfitWithdrawer } from './entities/profit-withdrawer.entity';
import { CreateProfitWithdrawerDto } from './dto/create-profit-withdrawer.dto';
import { UpdateProfitWithdrawerDto } from './dto/update-profit-withdrawer.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ProfitWithdrawerService {
  constructor(
    @InjectRepository(ProfitWithdrawer)
    private profitWithdrawerRepo: Repository<ProfitWithdrawer>
  ) {}
  create(createProfitWithdrawerDto: CreateProfitWithdrawerDto) {
    return 'This action adds a new profitWithdrawer';
  }

  findAll() {
    return `This action returns all profitWithdrawer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profitWithdrawer`;
  }

  update(id: number, updateProfitWithdrawerDto: UpdateProfitWithdrawerDto) {
    return `This action updates a #${id} profitWithdrawer`;
  }

  remove(id: number) {
    return `This action removes a #${id} profitWithdrawer`;
  }
}
