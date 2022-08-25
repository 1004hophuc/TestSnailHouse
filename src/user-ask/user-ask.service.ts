import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsService } from 'src/transactions/transactions.service';
import { User } from 'src/users/user.entity';
import { makeUid } from 'src/users/utils';
import {
  getAddressFromSign,
  isAddress,
  toCheckSumAddress,
} from 'src/utils/web3';
import { getMongoManager, Repository } from 'typeorm';
import { CreateUserAskDto } from './dto/create-user-ask.dto';
import { UpdateUserAskDto } from './dto/update-user-ask.dto';
import { UserAsk } from './entities/user-ask.entity';

export const HASH_MESSAGE = 'WINERY DAO';

@Injectable()
export class UserAskService {
  constructor(
    @InjectRepository(UserAsk) private userAskRepo: Repository<UserAsk>,
    private transactionsService: TransactionsService
  ) {}
  async create(createUserAskDto: CreateUserAskDto) {
    const { address, signature } = createUserAskDto;

    const signer = getAddressFromSign(HASH_MESSAGE, signature);

    if (!isAddress(address))
      throw new HttpException('Invalid Address', HttpStatus.BAD_REQUEST);

    if (signer !== toCheckSumAddress(address))
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);

    const isDao = await this.transactionsService.findOne({
      isStaked: true,
      address: address.toLowerCase(),
    });

    if (!isDao)
      throw new HttpException('User not allowed!', HttpStatus.NOT_FOUND);

    const ask = this.userAskRepo.create(createUserAskDto);

    ask.askId = makeUid(16);
    const savedAsk = await this.userAskRepo.save(ask);
    return savedAsk;
  }

  async findAll(query): Promise<[UserAsk[], number]> {
    const [asks, total] = await this.userAskRepo.findAndCount(query);

    return [asks, total];
  }

  async findOne(id: string) {
    const existAsk = await this.userAskRepo.findOne({
      where: {
        askId: id,
      },
    });
    return existAsk;
  }
}
