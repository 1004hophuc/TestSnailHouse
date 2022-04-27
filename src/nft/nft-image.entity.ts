import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

@Entity('nft-image')
export class NFTImage {
  @ObjectIdColumn() id: ObjectID;

  @Index({ unique: true })
  @Column({ unique: true })
  imageId: number;

  @Column()
  tokenId: number;

  @Index({ unique: true })
  @Column()
  image: string;

  @Column()
  level: string;

  @Column({ default: false, type: 'boolean' })
  isSold = false;

  @Column()
  createdAt: number;

  @Column()
  description: string;

  @BeforeInsert()
  updateDates() {
    this.createdAt = new Date().getTime();
  }

  constructor(transaction?: Partial<NFTImage>) {
    Object.assign(this, transaction);
  }
}
