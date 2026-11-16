import { Column, CreateDateColumn, Entity, Generated, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { User } from './User';
import type { Folder } from './Folder';

/** One completed quiz attempt, storing score and metadata for the history view. */
@Entity('quiz_attempts')
@Index('idx_quiz_attempts_user_folder', ['userId', 'folderId'])
export class QuizAttempt {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne('Folder', { onDelete: 'CASCADE' })
  folder: Folder;

  @Column({ type: 'int' })
  folderId: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  folderName: string;

  @Column({ type: 'varchar', length: 10 })
  mode: string; // 'choice' | 'flash'

  @Column({ type: 'int' })
  totalQuestions: number;

  @Column({ type: 'int' })
  correctAnswers: number;

  /** Quiz duration in seconds. */
  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
