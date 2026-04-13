import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('penalties')
export class Penalty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  student_name: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'date' })
  week_start: string;

  @Column()
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;
}
