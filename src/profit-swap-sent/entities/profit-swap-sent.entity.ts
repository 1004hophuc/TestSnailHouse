import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';

@Entity('profit-swap-sent')
export class ProfitSwapSent extends AbstractEntity {
  @Column()
  totalDaoUser: number;

  @Column()
  dateSendReward: number;

  // per user
  @Column()
  swapProfit: number;
}
