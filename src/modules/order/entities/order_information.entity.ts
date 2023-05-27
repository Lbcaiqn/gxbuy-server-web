import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { OrderItem } from './order_item.entity';

enum StateType {
  WAITPAID = 'wait_paid',
  WAITSHIPPED = 'wait_shipped',
  WAITRECEIVE = 'wait_receive',
  WAITCOMMENT = 'wait_comment',
  FINISH = 'finish',
  CANCEL = 'cancel',
  INVALID = 'invalid',
}

@Entity()
export class OrderInformation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({
    type: 'enum',
    enum: StateType,
  })
  order_state: StateType;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  add_time: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  update_time: Date;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  user_id: string;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, oitem => oitem.order_information)
  order_item: OrderItem[];
}
