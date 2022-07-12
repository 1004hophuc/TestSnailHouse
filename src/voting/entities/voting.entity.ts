import { Type } from 'class-transformer';
import { AbstractEntity } from 'src/common/entities';
import { Entity, Column } from 'typeorm';
import { OptionProperty, VoteType } from '../dto/create-voting.dto';

@Entity('voting')
export class Voting extends AbstractEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  type: VoteType;

  @Column()
  dateSubmit: number;

  @Column()
  dateStart: number;

  @Column()
  dateEnd: number;

  @Column()
  voteID: number;

  @Column()
  isPending: boolean;

  @Column()
  options: OptionProperty[];
}
