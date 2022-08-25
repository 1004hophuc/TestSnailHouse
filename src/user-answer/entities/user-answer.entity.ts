import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';

@Entity('user-answer')
export class UserAnswer extends AbstractEntity {
  @Column()
  answerDescription: string;

  @Column()
  answerImages: string[];

  @Column()
  address: string;

  @Column()
  askId: string;
}
