import { Injectable } from '@nestjs/common';

import { makeUid } from './utils';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from './user.entity';

import { TransactionsService } from '../transactions/transactions.service';

interface RefCode {
  address: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private transactionsServices: TransactionsService,
  ) {}

  async getRefCode({ address }: RefCode): Promise<string> {
    const newAddress = address.toLowerCase();
    const data = await this.usersRepository.findOne({ address: newAddress });
    if (data) {
      return data.refCode;
    }
    const newCode =
      makeUid(6) + newAddress.slice(-3, -1) + newAddress.slice(6, 8);

    while (true) {
      const existRef = await this.usersRepository.findOne({ refCode: newCode });

      if (!existRef) {
        break;
      }
    }

    const item = await this.usersRepository.create({
      address: newAddress,
      refCode: newCode,
      createdAt: new Date().getTime(),
    });

    const newData = await this.usersRepository.save(item);

    return newData.refCode;
  }

  async verifyRefCode(refCode: string): Promise<boolean> {
    const data = await this.usersRepository.findOne({ refCode });
    if (data) {
      return true;
    }

    return false;
  }

  async getTotalOfUser(address: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      address: address.toLowerCase(),
    });
    if (!user) {
      return null;
    }

    const amount = await this.transactionsServices.getAmountByRef(user.refCode);

    const commission = +process.env.TOTAL_COMMISSION || 0.05;

    return amount * commission || 0;
  }
}
