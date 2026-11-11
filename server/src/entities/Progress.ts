import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { MasterCard } from './MasterCard';

/** Study time for one deck on one day, in milliseconds. */
@Entity('progress')
export class Progress {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int', default: 0 })
  time: number;

  @Column({ type: 'timestamptz' })
  dayCreated: Date;

  @ManyToOne('MasterCard', 'progress', { onDelete: 'CASCADE' })
  masterCard: MasterCard;

  @Index('idx_progress_master_card_id')
  @Column({ type: 'int' })
  masterCardId: number;
}
