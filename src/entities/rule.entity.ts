import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  position: number;
}
