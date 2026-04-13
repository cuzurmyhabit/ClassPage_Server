import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'teacher' | 'career' | 'student';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;
}
