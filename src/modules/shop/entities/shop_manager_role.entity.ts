import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Shop } from './shop.entity';
import { ShopManager } from './shop_manager.entity';

@Entity()
export class ShopManagerRole {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  shop_manager_role_name: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  add_time: Date;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  shop_id: string;

  @ManyToOne(() => Shop, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ManyToMany(() => ShopManager, { createForeignKeyConstraints: false })
  @JoinTable({ name: 'sm_mtm_smr' })
  shop_manager: ShopManager[];
}
