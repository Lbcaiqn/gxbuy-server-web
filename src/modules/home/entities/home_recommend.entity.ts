import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class HomeRecommend {
  @PrimaryGeneratedColumn({ type: 'tinyint', unsigned: true })
  _id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  keyword: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  img: string;

  @Index()
  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  pid: number;

  @ManyToOne(() => HomeRecommend, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'pid' })
  parent: HomeRecommend;

  @OneToMany(() => HomeRecommend, hr => hr.parent)
  children: HomeRecommend[];

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
