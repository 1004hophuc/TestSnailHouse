import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn() id: ObjectID;

  @Index({ unique: true })
  @Column()
  address: string;

  @Index({ unique: true })
  @Column()
  refCode: string;

  @Column()
  createdAt: number;

  @BeforeInsert()
  nameToUpperCase() {
    this.address = this.address.toLowerCase();
  }

  @BeforeInsert()
  updateDates() {
    this.createdAt = new Date().getTime();
  }

  constructor(user?: Partial<User>) {
    Object.assign(this, user);
  }
}
