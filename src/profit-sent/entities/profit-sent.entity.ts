import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';

@Entity('profit-sent')
export class ProfitSent extends AbstractEntity {
  @Column()
  totalDaoUser: number;

  @Column()
  dateSendReward: number;

  @Column()
  idoProfit: number;

  @Column()
  seedInvestProfit: number;

  @Column()
  marketProfit: number;

  @Column()
  nftLaunchpadProfit: number;

  @Column()
  nftGameProfit: number;

  @Column()
  swapProfit: number;
}
