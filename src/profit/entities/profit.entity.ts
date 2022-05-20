import { AbstractEntity } from 'src/common/entities';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

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
  dateSendReward: number;

  @Column()
  user: string;

  @Column()
  amountProfit: number;

  @Column()
  weiAmountProfit: string;

  @Column()
  type: PROFIT_TYPE;

  @Column()
  dexProfit: number;

  @Column()
  daoProfitPercent: number;

  @Column()
  dateReward: number;

  @Column()
  totalDaoUser: number;

  @Column()
  isWithdraw: number; // 0:false, 1:true
}
