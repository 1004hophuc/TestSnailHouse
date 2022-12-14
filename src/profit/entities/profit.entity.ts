import { AbstractEntity } from 'src/common/entities';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
} from 'typeorm';

export enum PROFIT_TYPE {
  IDO = 'ido',
  SWAP = 'swap',
  MARKET = 'market',
  NFTLAUNCHPAD = 'nftLaunchpad',
  NFTGAME = 'nftGame',
  SEEDINVEST = 'seedInvest',
}

@Entity('profit')
export class Profit extends AbstractEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  @Index()
  user: string;

  @Column()
  amountProfit: number;

  @Column()
  weiAmountProfit: string;

  @Column()
  type: PROFIT_TYPE;

  @Column()
  dexProfit: number;
}
