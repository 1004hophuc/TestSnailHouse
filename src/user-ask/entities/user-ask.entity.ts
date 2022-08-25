import { AbstractEntity } from 'src/common/entities';
import { makeUid } from 'src/users/utils';
import { BeforeInsert, Column, Entity } from 'typeorm';

@Entity('user-ask')
export class UserAsk extends AbstractEntity {
  @Column()
  askDescription: string;

  @Column()
  askImages: string[];

  @Column()
  address: string;

  @Column()
  askId: string;

  @BeforeInsert()
  generateId() {
    this.askId = makeUid(16);
  }
}
