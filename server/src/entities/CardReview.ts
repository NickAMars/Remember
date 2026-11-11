import { Column, CreateDateColumn, Entity, Generated, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { User } from './User';
import type { SubCard } from './SubCard';

/** Spaced-repetition (SM-2) state for one user and one card. */
@Entity('card_reviews')
export class CardReview {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'real', default: 2.5 })
  easeFactor: number;

  @Column({ type: 'int', default: 0 })
  interval: number;

  @Column({ type: 'int', default: 0 })
  repetitions: number;

  @Column({ type: 'timestamptz' })
  nextReviewAt: Date;

  @Column({ type: 'timestamptz' })
  lastReviewedAt: Date;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne('SubCard', { onDelete: 'CASCADE' })
  subCard: SubCard;

  @Index('idx_card_reviews_sub_card_id')
  @Column({ type: 'int' })
  subCardId: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
