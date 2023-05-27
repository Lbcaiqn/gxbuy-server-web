import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { Shop } from './shop.entity';
import { ShopManagerRole } from './shop_manager_role.entity';

@Entity()
export class ShopManager {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  shop_manager_account: string;

  @Column({ type: 'varchar', length: 100, nullable: false, select: false })
  shop_manager_password: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  shop_manager_name: string;

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

  @ManyToMany(() => ShopManagerRole, { createForeignKeyConstraints: false })
  @JoinTable({ name: 'sm_mtm_smr' })
  shop_manager_role: ShopManagerRole[];
}
