import { AbstractEntity } from 'src/common/entities';
import { Column, ObjectIdColumn, ObjectID, Entity } from 'typeorm';

@Entity('rewards')
export class Reward extends AbstractEntity {
  @Column()
  dateReward: number;

  @Column()
  idoReward: number;

  @Column()
  swapReward: number;

  @Column()
  marketReward: number;

  @Column()
  isSent: boolean;
}
