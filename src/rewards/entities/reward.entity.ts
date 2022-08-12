import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';

@Entity('rewards')
export class Reward extends AbstractEntity {
  @Column()
  idoReward: number;

  @Column()
  marketReward: number;

  @Column()
  nftLaunchpadReward: number;

  @Column()
  nftGameReward: number;

  @Column()
  seedInvestReward: number;

  @Column()
  isSent: boolean;

  @Column()
  idoPercent: number;

  @Column()
  nftLaunchpadPercent: number;

  @Column()
  nftGamePercent: number;

  @Column()
  seedInvestPercent: number;
}
