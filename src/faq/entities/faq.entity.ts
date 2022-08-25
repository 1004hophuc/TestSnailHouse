import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';

@Entity('faq')
export class Faq extends AbstractEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  type: string;
}
