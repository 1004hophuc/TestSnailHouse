import {
  CreateDateColumn,
  ObjectID,
  UpdateDateColumn,
  ObjectIdColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export abstract class AbstractEntity {
  @ObjectIdColumn()
  public id: ObjectID;

  @Column({ type: 'number' })
  public createdAt: number;

  @Column({ type: 'number' })
  public updatedAt: number;

  @BeforeInsert()
  insertDates() {
    this.createdAt = new Date().getTime();
    this.updatedAt = new Date().getTime();
  }

  @BeforeUpdate()
  updateDates() {
    this.updatedAt = new Date().getTime();
  }
}
