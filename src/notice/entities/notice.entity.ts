import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';
import { NoticeType } from '../dto/create-notice.dto';

@Entity('notice')
export class Notice extends AbstractEntity {
  @Column()
  content: string;

  @Column()
  title: string;

  @Column()
  type: NoticeType;

  @Column()
  thumbnail: string;
}
