import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { Shop } from '@/modules/shop/entities/shop.entity';
import { GoodsSpu } from '@/modules/goods/entities/goods_spu.entity';
import { GoodsSku } from '@/modules/goods/entities/goods_sku.entity';
@Entity()
export class Shopcart {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({ type: 'boolean', nullable: false })
  selected: boolean;

  @Column({ type: 'int', nullable: false })
  quantity: number;

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

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  goods_sku_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  shop_id: string;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GoodsSpu, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'goods_spu_id' })
  goods_spu: GoodsSpu;

  @ManyToOne(() => GoodsSku, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'goods_sku_id' })
  goods_sku: GoodsSku;

  @ManyToOne(() => Shop, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;
}
