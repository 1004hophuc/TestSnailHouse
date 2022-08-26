import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNoticeDto, NoticeType } from './dto/create-notice.dto';
import { FilterType, QueryDto } from './dto/query-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { Notice } from './entities/notice.entity';

export const NOTICE_TYPE = [
  NoticeType.EVENT,
  NoticeType.NOTICE,
  NoticeType.VERSION,
];

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 5;

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice) private noticeRepo: Repository<Notice>
  ) {}
  async create(createNoticeDto: CreateNoticeDto) {
    const createNotice = this.noticeRepo.create(createNoticeDto);
    const notice = await this.noticeRepo.save(createNotice);
    return notice;
  }

  async findEveryType() {
    const allNotices = NOTICE_TYPE.reduce(async (obj, type) => {
      const { data, total } = await this.findWithType(type);

      const resolveObj = await obj;

      return {
        ...resolveObj,
        [type]: {
          data,
          total,
        },
      };
    }, Promise.resolve({}));

    return allNotices;
  }

  async findAll(queryDto: QueryDto) {
    const { page, limit, filter, filterType } = queryDto;

    const where =
      filter && filterType
        ? {
            $or: [
              {
                title:
                  filterType === FilterType.TITLE
                    ? new RegExp(filter, 'i')
                    : undefined,
              },
              {
                content:
                  filterType === FilterType.CONTENT
                    ? new RegExp(filter, 'i')
                    : undefined,
              },
            ],
          }
        : {};

    const [notice, total] = await this.noticeRepo.findAndCount({
      skip: page ? page - 1 : 0,
      take: (+page - 1) * limit || 20,

      where,
    });

    return { data: notice, total };
  }

  async findWithType(type: NoticeType) {
    const [notice, total] = await this.noticeRepo.findAndCount({
      where: {
        type,
      },
      skip: DEFAULT_SKIP,
      take: DEFAULT_TAKE,
      order: {
        createdAt: 'DESC',
      },
    });

    return { data: notice, total };
  }

  async findOne(id: string) {
    const notice = await this.noticeRepo.findOne(id);

    return notice;
  }

  update(id: number, updateNoticeDto: UpdateNoticeDto) {
    return `This action updates a #${id} notice`;
  }

  remove(id: string) {
    return `This action removes a #${id} notice`;
  }
}
