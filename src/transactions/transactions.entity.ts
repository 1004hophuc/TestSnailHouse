import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @ObjectIdColumn() id: ObjectID;

  @Index({ unique: true })
  @Column()
  address: string;

  @Index({ unique: true })
  @Column()
  refCode: string;

  @Column()
  type: string; // withdraw - deposit

  @Column()
  amount: number;

  @Column()
  createdAt: number;

  @Column()
  txHash: string;

  @BeforeInsert()
  nameToUpperCase() {
    this.address = this.address.toLowerCase();
  }

  @BeforeInsert()
  updateDates() {
    this.createdAt = new Date().getTime();
  }

  constructor(transaction?: Partial<Transaction>) {
    Object.assign(this, transaction);
  }
}
