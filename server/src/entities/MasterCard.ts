import { Column, CreateDateColumn, Entity, Generated, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { User } from './User';
import type { SubCard } from './SubCard';
import type { Progress } from './Progress';

/** A deck. Its cards are SubCards. */
@Entity('master_cards')
export class MasterCard {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 1000, default: '' })
  url: string;

  @Column({ type: 'int', default: 0 })
  timespent: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isCopied: boolean;

  @ManyToOne('User', 'masterCards', { onDelete: 'CASCADE' })
  user: User;

  @Index('idx_master_cards_user_id')
  @Column({ type: 'int' })
  userId: number;

  // perf Increase: not eager. Before, every lookup of a deck (even an ownership check)
  // loaded all of its cards. Ask for them with `relations: ['subCards']` when needed.
  @OneToMany('SubCard', 'masterCard', { cascade: true })
  subCards: SubCard[];

  @OneToMany('Progress', 'masterCard', { cascade: true })
  progress: Progress[];

  /** Filled in by `loadRelationCountAndMap` on list queries, not a column. */
  subCardCount?: number;

  /** Filled in by a sub-query on list queries, not a column. */
  reviewCount?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
