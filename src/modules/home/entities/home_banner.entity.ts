import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum BannerType {
  PC = 'PC',
  MOBILE = 'mobile',
}

@Entity()
export class HomeBanner {
  @PrimaryGeneratedColumn({ type: 'tinyint', unsigned: true })
  _id: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  img: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  to_url: string;

  @Column({
    type: 'enum',
    enum: BannerType,
    nullable: false,
  })
  type: BannerType;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  add_time: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  update_time: Date;
}
