import { AbstractEntity } from 'src/common/entities';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { PROFIT_TYPE } from './profit.entity';

@Entity('profit-type')
export class ProfitType extends AbstractEntity {
  @Column()
  account: string;
  @Column()
  txHash: string;
  @Column()
  dateTrade: number;
  @Column()
  type: ProfitType;
  @Column()
  tradeAmount: string;
}
