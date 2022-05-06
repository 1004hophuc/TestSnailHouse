import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

import { AbstractEntity } from '../../common/entities';

@Entity('pending_withdraw')
export class PendingWithdraw extends AbstractEntity {
  @ObjectIdColumn() id: ObjectID;

  @Index({ unique: true })
  @Column()
  account: string;

  @Column({ default: false })
  isPending: boolean;

  @BeforeInsert()
  nameToUpperCase() {
    this.account = this.account.toLowerCase();
  }

  constructor(transaction?: Partial<PendingWithdraw>) {
    super();
    Object.assign(this, transaction);
  }
}
