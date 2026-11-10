import { Column, Entity, Generated, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { PoolCard } from './PoolCard';

@Entity('pool_sub_cards')
export class PoolSubCard {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', default: '' })
  descriptions: string;

  @ManyToOne('PoolCard', 'subCards', { onDelete: 'CASCADE' })
  poolCard: PoolCard;

  @Column({ type: 'int' })
  poolCardId: number;
}
