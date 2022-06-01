
import {
    Entity,
    ObjectID,
    ObjectIdColumn,
    Column,
    Index,
    BeforeInsert,
} from 'typeorm';

import { AbstractEntity } from '../../common/entities';

import { HISTORY_TYPE } from '../../config';

@Entity('bingo')
export class Bingo extends AbstractEntity {
    @ObjectIdColumn() id: ObjectID;

    @Column({ default: 0 })
    point: number;

    @Index({ background: true })
    @Column()
    address: string;

}
