import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsSpu } from './goods_spu.entity';
import { GoodsSku } from './goods_sku.entity';
import { Shop } from '@/modules/shop/entities/shop.entity';
import { User } from '@/modules/user/entities/user.entity';
import { OrderInformation } from '@/modules/order/entities/order_information.entity';
import { OrderItem } from '@/modules/order/entities/order_item.entity';

enum LevelType {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

@Entity()
export class GoodsComment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({ type: 'json', nullable: true })
  goods_comment: Array<{
    comment: string;
    img_url: Array<string>;
    reoly: string;
  }>;

  @Column({ type: 'json', nullable: true })
  sku_sales_attrs: Array<{ name: string; value: string }>;

  @Column({
    type: 'enum',
    enum: LevelType,
    nullable: false,
  })
  describe_level: LevelType;

  @Column({
    type: 'enum',
    enum: LevelType,
    nullable: false,
  })
  service_level: LevelType;

  @Column({
    type: 'enum',
    enum: LevelType,
    nullable: false,
  })
  logistics_level: LevelType;

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
  @Column({ type: 'bigint', unsigned: true })
  order_information_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  order_item_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  user_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  shop_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  goods_spu_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  goods_sku_id: string;

  @ManyToOne(() => OrderInformation, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'order_information_id' })
  order_information: OrderInformation;

  @ManyToOne(() => OrderItem, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'order_item_id' })
  order_item: OrderInformation;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Shop, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ManyToOne(() => GoodsSpu, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'goods_spu_id' })
  goods_spu: GoodsSpu;

  @ManyToOne(() => GoodsSku, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'goods_sku_id' })
  goods_sku: GoodsSku;
}
