import { AbstractEntity } from 'src/common/entities';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

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
  weiAmountProfit: number;

  @Column()
  type: string;

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
