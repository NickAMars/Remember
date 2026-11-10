import { Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { MasterCard } from './MasterCard';

@Entity('sub_cards')
export class SubCard {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', default: '' })
  descriptions: string;

  @ManyToOne('MasterCard', 'subCards', { onDelete: 'CASCADE' })
  masterCard: MasterCard;

  @Column({ type: 'int' })
  masterCardId: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
