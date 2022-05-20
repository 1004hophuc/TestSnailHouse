import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAirdropDto } from './dto/create-airdrop.dto';
import { UpdateAirdropDto } from './dto/update-airdrop.dto';
import { Airdrop } from './entities/airdrop.entity';

@Injectable()
export class AirdropsService {
  constructor(
    @InjectRepository(Airdrop) private airdropRepo: Repository<Airdrop>
  ) {}
  async create(createAirdropDto: CreateAirdropDto) {
    const existAirdrop = await this.airdropRepo.findOne(createAirdropDto);
    if (existAirdrop) {
      return {
        statusCode: 409,
        message: 'Airdrop is already exist!',
      };
    }
    const airdropCreate = this.airdropRepo.create(createAirdropDto);
    const airdropSave = await this.airdropRepo.save(airdropCreate);
    return airdropSave;
  }

  async findAll() {
    const airdrops = await this.airdropRepo.find();
    return airdrops;
  }

  public async getPaginateAirdrops(page: number, limit: number) {
    try {
      const [data, total] = await this.airdropRepo.findAndCount({
        order: {
          dateStart: 'ASC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      return { data, total };
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    const airdrop = await this.airdropRepo.findOne(id);
    return airdrop;
  }

  async update(id: string, updateAirdropDto: UpdateAirdropDto) {
    await this.airdropRepo.update(id, updateAirdropDto);
    return {
      statusCode: 203,
      message: 'Item update successfully',
    };
  }

  async remove(id: string) {
    await this.airdropRepo.delete(id);
  }
}
