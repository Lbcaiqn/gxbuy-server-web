import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { GoodsSpu } from '@/modules/goods/entities/goods_spu.entity';
import { GoodsSku } from '@/modules/goods/entities/goods_sku.entity';
import { Shopcart } from '@/modules/shopcart/entities/shopcart.entity';
import { ShopManager } from './shop_manager.entity';
import { ShopManagerRole } from './shop_manager_role.entity';
import { UserFollow } from '@/modules/user/entities/user_follow.entity';
import { OrderItem } from '@/modules/order/entities/order_item.entity';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  shop_account: string;

  @Column({ type: 'varchar', length: 100, nullable: false, select: false })
  shop_password: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  shop_name: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  shop_logo: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  add_time: Date;

  @OneToMany(() => GoodsSpu, gspu => gspu.shop)
  goods_spu: GoodsSpu[];

  @OneToMany(() => GoodsSku, gsku => gsku.shop)
  goods_sku: GoodsSku[];

  @OneToMany(() => Shopcart, sc => sc.shop)
  shopcart: Shopcart[];

  @OneToMany(() => ShopManagerRole, smr => smr.shop)
  shop_manager_role: ShopManagerRole[];

  @OneToMany(() => ShopManager, sm => sm.shop)
  shop_manager: ShopManager[];

  @OneToMany(() => UserFollow, uf => uf.shop)
  user_follow: UserFollow[];

  @OneToMany(() => OrderItem, oitem => oitem.shop)
  order_item: OrderItem[];
}
