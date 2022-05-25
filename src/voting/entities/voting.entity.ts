import { AbstractEntity } from 'src/common/entities';
import { Entity, Column } from 'typeorm';
import { OptionProperty } from '../dto/create-voting.dto';

@Entity('voting')
export class Voting extends AbstractEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  dateSubmit: number;

  @Column()
  dateStart: number;

  @Column()
  dateEnd: number;

  @Column()
  options: OptionProperty[];
}
