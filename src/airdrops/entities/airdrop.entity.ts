import { AbstractEntity } from 'src/common/entities';
import { Column, Entity  } from 'typeorm';

@Entity('airdrops')
export class Airdrop extends AbstractEntity {
  @Column()
  tokenAddress: string;
  @Column()
  tokenName: string;
  @Column()
  amountPerUser: number;
  @Column()
  dateStart: number;
  @Column()
  dateEnd: number;
}
