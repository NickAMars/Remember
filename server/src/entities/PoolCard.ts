import { Column, CreateDateColumn, Entity, Generated, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { PoolSubCard } from './PoolSubCard';

/** A public copy of a deck that other users can browse and copy. */
@Entity('pool_cards')
export class PoolCard {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  /** The uuid of the user who shared it. */
  @Index('idx_pool_cards_author')
  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  // perf Increase: not eager, so the Browse list doesn't load every public card.
  @OneToMany('PoolSubCard', 'poolCard', { cascade: true })
  subCards: PoolSubCard[];

  /** Filled in by `loadRelationCountAndMap` on list queries, not a column. */
  subCardCount?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
