import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMailSubmitDto } from './dto/create-mail-submit.dto';
import { UpdateMailSubmitDto } from './dto/update-mail-submit.dto';
import { MailSubmit } from './entities/mail-submit.entity';

@Injectable()
export class MailSubmitService {
  constructor(
    @InjectRepository(MailSubmit) private mailRepo: Repository<MailSubmit>
  ) {}
  async mailSubmit(createMailSubmitDto: CreateMailSubmitDto) {
    const existMail = await this.mailRepo.findOne({
      email: createMailSubmitDto.email,
    });
    if (existMail) return;

    const submitMail = this.mailRepo.create(createMailSubmitDto);
    const mailSave = await this.mailRepo.save(submitMail);
    return mailSave;
  }

  findAll() {
    return `This action returns all mailSubmit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mailSubmit`;
  }

  update(id: number, updateMailSubmitDto: UpdateMailSubmitDto) {
    return `This action updates a #${id} mailSubmit`;
  }

  remove(id: number) {
    return `This action removes a #${id} mailSubmit`;
  }
}
