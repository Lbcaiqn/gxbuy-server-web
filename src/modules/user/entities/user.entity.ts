import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Shopcart } from '@/modules/shopcart/entities/shopcart.entity';
import { UserFavorite } from './user_favorite.entity';
import { UserSearchHistory } from './user_search_history.entity';
import { UserBrowseHistory } from './user_browse_history.entity';
import { UserFollow } from './user_follow.entity';
import { OrderInformation } from '@/modules/order/entities/order_information.entity';
import { OrderItem } from '@/modules/order/entities/order_item.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  user_account: string;

  @Column({ type: 'varchar', length: 100, nullable: false, select: false })
  user_password: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  user_name: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  user_icon: string;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  shopcart_total_all: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_all: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_wait_paid: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_wait_shipped: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_wait_receive: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_wait_comment: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_finish: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_cancel: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 0 })
  order_total_invalid: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  add_time: Date;

  @OneToMany(() => UserFavorite, uf => uf.user)
  user_favorite: UserFavorite[];

  @OneToMany(() => UserSearchHistory, ush => ush.user)
  user_search_history: UserSearchHistory[];

  @OneToMany(() => UserBrowseHistory, ubh => ubh.user)
  user_browse_history: UserBrowseHistory[];

  @OneToMany(() => UserFollow, uf => uf.user)
  user_follow: UserFavorite[];

  @OneToMany(() => Shopcart, sc => sc.user)
  shopcart: Shopcart[];

  @OneToMany(() => OrderInformation, oinfo => oinfo.user)
  order_information: OrderInformation[];

  @OneToMany(() => OrderItem, oitem => oitem.user)
  order_item: OrderItem[];
}
