import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { CreateVotingDto, VoteType } from './dto/create-voting.dto';
import { QueryDto } from './dto/query-voting.dto';
import { UpdateVotingDto } from './dto/update-voting.dto';
import { Voting } from './entities/voting.entity';
import { Abi as VotingAbi } from '../contract/Voting';
import Promise from 'bluebird';
import abiDecoder from 'abi-decoder';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class VotingService {
  constructor(
    @InjectRepository(Voting) private votingRepo: Repository<Voting>,
    private configurationService: ConfigurationService
  ) {}
  async create(createVotingDto: CreateVotingDto) {
    const createVote = this.votingRepo.create(createVotingDto);
    delete createVote.isPending;

    let voteID = (await this.configurationService.findOne('voteid'))?.value;

    if (!voteID) {
      await this.configurationService.create({
        name: 'voteid',
        value: '0',
        key: process.env.KEY_INIT,
      });
      voteID = '0';
    }
    createVote.voteID = +voteID;
    createVote.isPending = true;
    const saveVote = await this.votingRepo.save(createVote);
    const proposalUrl = `${process.env.APP_DOMAIN}/voting/${createVote.id}`;
    return { ...saveVote, proposalUrl };
  }

  async findAll() {
    const votes = await this.votingRepo.find({ where: { isPending: false } });
    return votes;
  }

  async getPaginate(query: QueryDto) {
    const { page, limit, type } = query;
    const [data, total] = await this.votingRepo.findAndCount({
      order: {
        dateStart: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
      where: type ? { type, isPending: false } : { isPending: false },
    });

    return { data, total };
  }

  async findOne(id: string) {
    const vote = await this.votingRepo.findOne(id);
    return vote;
  }
  // EVERY 40 SEC
  @Cron('*/40 * * * * *')
  async getVotingTransactionJob() {
    try {
      console.log('Start Voting transaction job ');
      await this.crawlVotingTransaction();
      console.log('End Voting transaction job ');
    } catch (error) {
      console.log(error?.response?.error);
      throw error;
    }
  }

  async crawlVotingTransaction() {
    try {
      const latestVotingBlock = await this.configurationService.findOne(
        'last_voting_block'
      );
      const allTransaction = (
        await axios.get(process.env.DOMAIN_BSC, {
          params: {
            address: process.env.CONTRACT_VOTING,
            apikey: process.env.BSC_API_KEY,
            action: 'txlist',
            module: 'account',
            sort: 'asc',
            startblock: latestVotingBlock?.value || 0,
          },
        })
      ).data.result;
      abiDecoder.addABI(VotingAbi);

      for (let i = 0; i < allTransaction.length; i++) {
        const decodedData = await abiDecoder.decodeMethod(
          allTransaction[i]?.input
        );
        if (!decodedData) continue; // On deploy contract
        const { name, params } = decodedData;

        //  filter create vote only.
        if (name === 'createProposal') {
          //  Check if proposal URL on contract match with the existing proposal on DB
          const votingIDSplit = params[0].value.split('/').slice(-1)[0];
          const voteExist = await this.votingRepo.findOne(votingIDSplit);

          //  If there is one existing proposal that is pending
          //  update voteID of the proposal then increase value in the config 'voteid'
          if (voteExist && voteExist.isPending) {
            const currentVoteId = await this.configurationService.findOne(
              'voteid'
            );

            voteExist.isPending = false;
            voteExist.voteID = +currentVoteId.value;
            const voteDbID = voteExist.id;
            delete voteExist.id;
            await this.votingRepo.update(voteDbID, voteExist);
            await this.configurationService.update(
              'voteid',
              (+currentVoteId.value + 1).toString()
            );
          }
        }
      }

      //  Update last block to configuration
      const lastestVotingBscBlock =
        allTransaction[allTransaction.length - 1].blockNumber;

      if (!latestVotingBlock) {
        await this.configurationService.create({
          name: 'last_voting_block',
          value: lastestVotingBscBlock,
          key: process.env.KEY_INIT,
        });
        return;
      }

      await this.configurationService.update(
        'last_voting_block',
        lastestVotingBscBlock
      );

      return;
    } catch (error) {
      console.log(error);
    }
  }

  update(id: number, updateVotingDto: UpdateVotingDto) {
    return `This action updates a #${id} voting`;
  }

  remove(id: number) {
    return `This action removes a #${id} voting`;
  }
}
