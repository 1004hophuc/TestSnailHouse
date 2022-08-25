import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { getMongoManager, Repository } from 'typeorm';
import { Abi as MasterchefAbi } from '../contract/Masterchef';
import { Abi as VotingAbi } from '../contract/Voting';
import { CreateBulkFaqDto, CreateFaqDto, FaqType } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';

import abiDecoder from 'abi-decoder';
import { UserAnswerService } from 'src/user-answer/user-answer.service';
import { UserAsk } from 'src/user-ask/entities/user-ask.entity';
import { UserAskService } from 'src/user-ask/user-ask.service';
import { QueryFaqDto } from './dto/query-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq) private faqRepository: Repository<Faq>,
    private readonly userAskService: UserAskService,
    private readonly userAnswerService: UserAnswerService
  ) {}

  async create(createFaqDto: CreateFaqDto) {
    const faq = this.faqRepository.create(createFaqDto);
    const saveFaq = await this.faqRepository.save(faq);

    return saveFaq;
  }

  async createBulk(createBulkFaqDto: CreateBulkFaqDto) {
    const bulkFaqList: Faq[] = createBulkFaqDto.faqs.map((faq) =>
      this.faqRepository.create(faq)
    );
    const saveBulkRes = await this.faqRepository.save(bulkFaqList);
    return saveBulkRes;
  }

  async getWithType(queryFaq: QueryFaqDto) {
    const { page, limit, type, filter } = queryFaq;

    const whereType = type
      ? {
          type,
        }
      : undefined;

    const [faqs, total] = await this.faqRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...whereType,
        $or: [
          { title: new RegExp(filter, 'i') },
          { content: new RegExp(filter, 'i') },
        ],
      },
    });
    return { data: faqs, total };
  }

  async findAll() {
    const faqs = await this.faqRepository.find();

    return faqs;

    // const stakeNFTTransactions = await axios.get(process.env.DOMAIN_BSC, {
    //   params: {
    //     address: '0x21694642bea2d2e0b0f5129a25d753dd9fb9623a',
    //     apikey: process.env.BSC_API_KEY,
    //     action: 'txlist',
    //     module: 'account',
    //     sort: 'desc',
    //     startblock: 0,
    //   },
    // });
    // return stakeNFTTransactions.data.result;
    // const filter = stakeNFTTransactions.data.result.filter(
    //   (a) => a.methodId === '0x1058d281' || a.methodId === '0x41441d3b' // leavestaking
    //   // '0x41441d3b' enterStaKING
    //   // '0x8a6655d6' vote
    // );

    // return filter;
  }

  async getAllAsks(queryAsk: QueryFaqDto) {
    const { page, limit } = queryAsk;

    const [asks, total] = await this.userAskService.findAll({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const arr = [];

    for (let i = 0; i < asks.length; i++) {
      const { askId } = asks[i];
      const existAnswer = await this.userAnswerService.findAnswers(askId);
      arr.push({
        ask: asks[i],
        answer: existAnswer,
        totalAnswer: existAnswer.length,
      });
    }

    return { data: arr, total };
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    const faq = await this.faqRepository.update(id, updateFaqDto);
    return faq;
  }

  async remove(id: string) {
    const deleteItem = await this.faqRepository.delete(id);

    return deleteItem;
  }

  async getUserAsk(askId: string) {
    const existAsk = await this.userAskService.findOne(askId);
    if (!existAsk) throw new HttpException('FAQ not found!', 404);

    const existAnswer = await this.userAnswerService.findAnswers(askId);

    return {
      ask: existAsk,
      answer: existAnswer,
      totalAnswer: existAnswer.length,
    };
  }
}
