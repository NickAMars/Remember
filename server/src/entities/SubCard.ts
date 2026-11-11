import { Column, CreateDateColumn, Entity, Generated, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { MasterCard } from './MasterCard';

/** One question/answer card inside a deck. `title` is the question, `descriptions` the answer. */
@Entity('sub_cards')
@Index('idx_sub_cards_master_card_id_created_at', ['masterCardId', 'createdAt'])
export class SubCard {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 1000 })
  title: string;

  @Column({ type: 'text', default: '' })
  descriptions: string;

  @Column({ type: 'varchar', length: 2000, default: '' })
  link: string;

  /** Whether the user has flagged this card for extra review. */
  @Column({ type: 'boolean', default: false })
  markedForReview: boolean;

  /** Similar but incorrect answers, used as the wrong choices in Quiz mode. */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  wrongAnswers: string[];

  @ManyToOne('MasterCard', 'subCards', { onDelete: 'CASCADE' })
  masterCard: MasterCard;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int' })
  masterCardId: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
