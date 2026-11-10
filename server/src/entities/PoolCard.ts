import { Column, CreateDateColumn, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { PoolSubCard } from './PoolSubCard';

@Entity('pool_cards')
export class PoolCard {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @OneToMany('PoolSubCard', 'poolCard', { cascade: true, eager: true })
  subCards: PoolSubCard[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
