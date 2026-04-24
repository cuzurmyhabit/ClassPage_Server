import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('settings')
export class Setting {
  /** DB 컬럼명: PostgreSQL 예약어 충돌 방지 */
  @PrimaryColumn({ length: 100, name: 'setting_key' })
  key: string;

  @Column({ type: 'text', default: '' })
  value: string;
}
