import { Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from 'src/common/entities';

@Entity('email-submit')
export class MailSubmit extends AbstractEntity {
  @Column()
  email: string;
}
