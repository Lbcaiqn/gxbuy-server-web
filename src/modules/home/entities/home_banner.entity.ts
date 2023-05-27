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
}
