
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

export enum BingoTransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
}

export enum BingoTransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAW = 'WITHDRAW',
}

@Entity('bingo-transaction')
export class BingoTransaction extends AbstractEntity {
    @ObjectIdColumn() id: ObjectID;

    @Column({ default: 0 })
    amount: number;

    @Column()
    txHash: string;

    @Column()
    address: string;

    @Column()
    status: BingoTransactionStatus;

    @Column()
    type: BingoTransactionType;

}
