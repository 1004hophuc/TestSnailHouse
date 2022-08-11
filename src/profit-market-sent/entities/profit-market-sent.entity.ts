import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';

@Entity('profit-market-sent')
export class ProfitMarketSent extends AbstractEntity {
  @Column()
  totalDaoUser: number;

  @Column()
  dateSendReward: number;

  // per user
  @Column()
  marketProfit: number;
}
