import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

export enum LaunchPadIndex {
  BUY_NFT = 0,
  SEND_NFT = 1,
}

@Entity('ido-nft')
export class IDONFT {
  @ObjectIdColumn() id: ObjectID;

  @Index({ unique: true })
  @Column()
  tokenId: number;

  @Column({ default: 1 })
  level: number;

  @Column()
  tokenOwner: string;

  @Column()
  image: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ enum: LaunchPadIndex })
  launchpad_index: number;

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

  constructor(transaction?: Partial<IDONFT>) {
    Object.assign(this, transaction);
  }
}
