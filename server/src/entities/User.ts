import { Column, CreateDateColumn, Entity, Generated, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { MasterCard } from './MasterCard';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  oauthCode: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 20, default: 'local' })
  authType: string;

  @OneToMany('MasterCard', 'user')
  masterCards: MasterCard[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
