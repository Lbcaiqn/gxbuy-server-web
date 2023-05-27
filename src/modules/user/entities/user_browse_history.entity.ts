import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { GoodsSpu } from '@/modules/goods/entities/goods_spu.entity';

@Entity()
export class UserBrowseHistory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  add_time: Date;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  user_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  goods_spu_id: string;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GoodsSpu, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'goods_spu_id' })
  goods_spu: GoodsSpu;
}
