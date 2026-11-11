import { Column, CreateDateColumn, Entity, Generated, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { User } from './User';
import type { MasterCard } from './MasterCard';

// A folder groups a user's decks (master cards). A deck can sit in more than one folder.
@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  user: User;

  @Index('idx_folders_user_id')
  @Column({ type: 'int' })
  userId: number;

  @ManyToMany('MasterCard', { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'folder_master_cards',
    joinColumn: { name: 'folder_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'master_card_id', referencedColumnName: 'id' },
  })
  masterCards: MasterCard[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
