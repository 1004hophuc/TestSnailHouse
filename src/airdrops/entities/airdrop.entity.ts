import { AbstractEntity } from 'src/common/entities';
import { Column, Entity } from 'typeorm';
import { AirdropType } from '../dto/create-airdrop.dto';

export enum airdropStatus {
  PENDING = 'pending',
  FINISH = 'finish',
}

@Entity('airdrops')
export class Airdrop extends AbstractEntity {
  @Column()
  tokenAddress: string;
  @Column()
  tokenName: string;
  @Column()
  amountPerUser: number;

  @Column()
  type: AirdropType;

  @Column()
  description: string;

  @Column()
  dateStart: number;

  @Column()
  dateEnd: number;

  @Column({ enum: airdropStatus })
  status: airdropStatus;
}
