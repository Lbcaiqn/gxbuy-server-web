import { Entity, Column, PrimaryGeneratedColumn, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Attribute } from '@/modules/category/entities/attribute.entity';
import { GoodsSpu } from './goods_spu.entity';

@Entity()
export class GoodsAttribute {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  _id: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  goods_instance_value: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  add_time: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  update_time: Date;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  attr_id: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  goods_spu_id: string;

  @ManyToOne(() => Attribute, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'attr_id' })
  attribute: Attribute;

  @ManyToOne(() => GoodsSpu, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'goods_spu_id' })
  goods_spu: GoodsSpu;
}
