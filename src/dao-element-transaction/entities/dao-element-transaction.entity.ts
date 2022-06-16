import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import { AbstractEntity } from '../../common/entities/index';

export enum ElementType {
  LAUNCHPAD = 'launchpad',
  MARKET = 'market',
  ROUTER = 'router',
}

export enum UnitToken {
  BUSD = 'busd',
  CORK = 'cork',
  BNB_BUSD = 'bnb_busd',
  ADO_BNB = 'cork_bnb',
  ADO_BUSD = 'cork_busd',
}

@Entity('dao-element-transaction')
export class DaoElementTransaction extends AbstractEntity {
  @Index({ unique: true })
  @Column()
  txhash: string;

  @Column()
  block_number: number;

  @Column({ enum: ElementType })
  type: ElementType;

  @Column()
  value: number;

  @Column()
  corkValue: number;

  @Column()
  unit_token_address: string;

  @Column()
  unit_token_name: string;

  @Column()
  from_address: string;

  @Column()
  to_address: string;

  @Column()
  timestamp: string;

  @Column()
  _created: number;

  @Column()
  _modified: number;

  @BeforeInsert()
  insertDates(): void {
    this._created = new Date().getTime();
    this._modified = new Date().getTime();
  }

  @BeforeUpdate()
  updateDates(): void {
    this.updatedAt = new Date().getTime();
  }

  constructor(transaction?: Partial<DaoElementTransaction>) {
    super();
    Object.assign(this, transaction);
  }
}
