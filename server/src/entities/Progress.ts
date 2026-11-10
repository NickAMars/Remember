import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { MasterCard } from './MasterCard';

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

  @Column({ type: 'int' })
  masterCardId: number;
}
