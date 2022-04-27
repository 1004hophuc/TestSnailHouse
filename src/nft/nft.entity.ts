import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

@Entity('nft')
export class NFT {
  @ObjectIdColumn() id: ObjectID;

  @Index({ unique: true })
  @Column()
  tokenId: number;

  @Column()
  level: number;

  @Index({ unique: true })
  @Column()
  tokenOwner: string;

  @Column()
  image: string; // withdraw - deposit

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  createdAt: number;

  @BeforeInsert()
  nameToUpperCase() {
    this.tokenOwner = this.tokenOwner.toLowerCase();
  }

  @BeforeInsert()
  updateDates() {
    this.createdAt = new Date().getTime();
  }

  constructor(transaction?: Partial<NFT>) {
    Object.assign(this, transaction);
  }
}
