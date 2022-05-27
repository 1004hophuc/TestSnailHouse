import { AbstractEntity } from 'src/common/entities';
import { PROFIT_TYPE } from 'src/profit/entities/profit.entity';
import { Column, ObjectIdColumn, ObjectID, Entity } from 'typeorm';
import { WithdrawStatus } from '../dto/create-profit-withdrawer.dto';

@Entity('profit-withdrawer')
export class ProfitWithdrawer extends AbstractEntity {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  account: string;

  @Column()
  amountWithdraw: number;

  @Column()
  amountWeiWithdraw: string;

  @Column()
  dateWithdraw: number;

  @Column()
  type: PROFIT_TYPE;

  @Column()
  txHash: string;

  @Column()
  status: WithdrawStatus;
}
