import { Injectable } from '@nestjs/common';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { Configuration } from './entities/configuration.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>,
  ) {}

  async create(createConfigurationDto: CreateConfigurationDto) {
    if (createConfigurationDto.key != process.env.KEY_INIT) {
      return false;
    }

    delete createConfigurationDto.key;

    const item = await this.configurationRepository.create(
      createConfigurationDto,
    );
    const data = await this.configurationRepository.save(item);
    return data;
  }

  findAll() {
    return `This action returns all configuration`;
  }

  async findOne(name: string) {
    const data = await this.configurationRepository.findOne({ name });

    return data;
  }

  async update(name: string, value: string) {
    try {
      const e = await this.configurationRepository.findOne({
        name,
      });
      e.value = value;
      return await this.configurationRepository.save(e);
    } catch (e) {
      console.log('update configuration : ', e);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} configuration`;
  }
}
