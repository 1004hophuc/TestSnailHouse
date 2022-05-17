import { AbstractEntity } from 'src/common/entities';
import { Column, ObjectIdColumn, ObjectID, Entity } from 'typeorm';

@Entity('profit-withdrawer')
export class ProfitWithdrawer extends AbstractEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  account: string;

  @Column()
  amountWithdraw: number;

  @Column()
  dateWithdraw: number;

  @Column()
  type: string;

  @Column()
  txHash: string;

  @Column()
  status: string;
}
