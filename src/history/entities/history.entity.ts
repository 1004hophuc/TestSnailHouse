import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

import { AbstractEntity } from '../../common/entities';

import { HISTORY_TYPE } from '../../config';

@Entity('history')
export class History extends AbstractEntity {
  @ObjectIdColumn() id: ObjectID;

  @Column()
  amount: number;

  @Index({ background: true })
  @Column()
  account: string;

  @Column({ default: 'withdraw' })
  type: string; // withdraw - deposit

  @Column({ default: HISTORY_TYPE.PENDING })
  status: string;

  @Column()
  txHash: string;

  @BeforeInsert()
  nameToUpperCase() {
    this.account = this.account.toLowerCase();
  }

  constructor(transaction?: Partial<History>) {
    super();
    Object.assign(this, transaction);
  }
}
