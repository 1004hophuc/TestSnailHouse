import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

import { AbstractEntity } from '../../common/entities';

@Entity('config')
export class Configuration extends AbstractEntity {
  @ObjectIdColumn() id: ObjectID;

  @Column()
  value: string;

  @Index({ unique: true })
  @Column()
  name: string;

  @BeforeInsert()
  nameToUpperCase() {
    this.name = this.name.toLowerCase();
  }

  constructor(transaction?: Partial<Configuration>) {
    super();
    Object.assign(this, transaction);
  }
}
