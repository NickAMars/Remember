import { Column, CreateDateColumn, Entity, Generated, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { User } from './User';
import type { SubCard } from './SubCard';
import type { Progress } from './Progress';

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

  @ManyToOne('User', 'masterCards', { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @OneToMany('SubCard', 'masterCard', { cascade: true, eager: true })
  subCards: SubCard[];

  @OneToMany('Progress', 'masterCard', { cascade: true, eager: true })
  progress: Progress[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
