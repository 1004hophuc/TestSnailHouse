import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  Index,
  BeforeInsert,
} from 'typeorm';

@Entity('ido-nft-image')
export class IDONFTImage {
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
  isSold: boolean;

  @Column()
  createdAt: number;

  @Column()
  description: string;

  @BeforeInsert()
  updateDates() {
    this.createdAt = new Date().getTime();
  }

  constructor(transaction?: Partial<IDONFTImage>) {
    Object.assign(this, transaction);
  }
}
