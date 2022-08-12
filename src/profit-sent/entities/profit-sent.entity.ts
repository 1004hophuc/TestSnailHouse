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
  nftLaunchpadProfit: number;

  @Column()
  nftGameProfit: number;

  @Column()
  idoPercent: number;

  @Column()
  seedInvestPercent: number;

  @Column()
  nftLaunchpadPercent: number;

  @Column()
  nftGamePercent: number;
}
