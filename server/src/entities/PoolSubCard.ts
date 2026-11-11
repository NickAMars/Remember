import { Column, Entity, Generated, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { PoolCard } from './PoolCard';

@Entity('pool_sub_cards')
export class PoolSubCard {
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

  /** Similar but incorrect answers, used as the wrong choices in Quiz mode. */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  wrongAnswers: string[];

  @ManyToOne('PoolCard', 'subCards', { onDelete: 'CASCADE' })
  poolCard: PoolCard;

  @Index('idx_pool_sub_cards_pool_card_id')
  @Column({ type: 'int' })
  poolCardId: number;
}
