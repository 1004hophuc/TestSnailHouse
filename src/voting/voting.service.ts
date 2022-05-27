import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVotingDto } from './dto/create-voting.dto';
import { UpdateVotingDto } from './dto/update-voting.dto';
import { Voting } from './entities/voting.entity';

@Injectable()
export class VotingService {
  constructor(
    @InjectRepository(Voting) private votingRepo: Repository<Voting>
  ) {}
  async create(createVotingDto: CreateVotingDto) {
    const createVote = this.votingRepo.create(createVotingDto);
    const voteID = (await this.findAll()).length;
    createVote.voteID = voteID;
    const saveVote = await this.votingRepo.save(createVote);
    const proposalUrl = `${process.env.APP_DOMAIN}/voting/${createVote.id}`;

    return { ...saveVote, proposalUrl };
  }

  async findAll() {
    const votes = await this.votingRepo.find();
    return votes;
  }

  async getPaginate(page: number, limit: number) {
    const [data, total] = await this.votingRepo.findAndCount({
      order: {
        dateStart: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string) {
    const vote = await this.votingRepo.findOne(id);
    return vote;
  }

  update(id: number, updateVotingDto: UpdateVotingDto) {
    return `This action updates a #${id} voting`;
  }

  remove(id: number) {
    return `This action removes a #${id} voting`;
  }
}
