import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';

@Entity('rewards')
export class Reward extends AbstractEntity {
  @Column()
  dateReward: number;

  @Column()
  idoReward: number;

  @Column()
  swapReward: number;

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
  idoURL: string;

  @Column()
  swapURL: string;

  @Column()
  marketURL: string;

  @Column()
  nftLaunchpadURL: string;

  @Column()
  seedInvestURL: string;

  @Column()
  nftGameURL: string;
}
