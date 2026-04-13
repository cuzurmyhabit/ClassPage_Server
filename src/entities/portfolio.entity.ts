import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', default: '' })
  summary: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 500, default: '' })
  link: string;

  @UpdateDateColumn()
  updated_at: Date;
}
