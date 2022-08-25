import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionsService } from 'src/transactions/transactions.service';
import { HASH_MESSAGE, UserAskService } from 'src/user-ask/user-ask.service';
import {
  getAddressFromSign,
  isAddress,
  toCheckSumAddress,
} from 'src/utils/web3';
import { Repository } from 'typeorm';
import { CreateUserAnswerDto } from './dto/create-user-answer.dto';
import { UpdateUserAnswerDto } from './dto/update-user-answer.dto';
import { UserAnswer } from './entities/user-answer.entity';

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private userAnswerRepo: Repository<UserAnswer>,
    private transactionService: TransactionsService,
    private userAskService: UserAskService
  ) {}
  async create(createUserAnswerDto: CreateUserAnswerDto) {
    const { address, askId, signature } = createUserAnswerDto;

    const signer = getAddressFromSign(HASH_MESSAGE, signature);
    if (!isAddress(address))
      throw new HttpException('Invalid Address', HttpStatus.BAD_REQUEST);

    if (signer !== toCheckSumAddress(address))
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);

    const isDAO = await this.transactionService.findOne({
      isStaked: true,
      address: address.toLowerCase(),
    });
    if (!isDAO)
      throw new HttpException('User not allowed!', HttpStatus.FORBIDDEN);

    const existAsk = await this.userAskService.findOne(askId);
    if (!existAsk)
      throw new HttpException('Ask not FOUND!', HttpStatus.NOT_FOUND);

    const answer = this.userAnswerRepo.create(createUserAnswerDto);

    const saveAnswer = await this.userAnswerRepo.save(answer);

    return saveAnswer;
  }

  async findAnswers(askId: string) {
    const answers = await this.userAnswerRepo.find({
      where: {
        askId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return answers;
  }

  findAll() {
    return `This action returns all userAnswer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAnswer`;
  }

  update(id: number, updateUserAnswerDto: UpdateUserAnswerDto) {
    return `This action updates a #${id} userAnswer`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAnswer`;
  }
}
