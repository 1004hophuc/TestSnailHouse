import {
  BeforeInsert,
  Column,
  ObjectIdColumn,
  ObjectID,
  Entity,
} from 'typeorm';

@Entity('rewards')
export class Reward {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  idoReward: number;

  @Column()
  swapReward: number;

  @Column()
  marketReward: number;

  @Column()
  createdAt: number;

  @BeforeInsert()
  updateDates() {
    this.createdAt = new Date().getTime();
  }
}
