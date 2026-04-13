import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('meal_cache')
export class MealCache {
  @PrimaryColumn({ type: 'date' })
  meal_date: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'datetime' })
  fetched_at: Date;
}
