import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Penalty } from '../entities/penalty.entity';

/** Monday of the week containing `d` (local calendar), start of day. */
export function weekStartFor(d: Date): Date {
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

@Injectable()
export class PenaltiesService {
  constructor(
    @InjectRepository(Penalty)
    private readonly penaltiesRepo: Repository<Penalty>,
  ) {}

  findByWeek(weekStart: string): Promise<Penalty[]> {
    return this.penaltiesRepo.find({
      where: { week_start: weekStart },
      relations: ['creator'],
      order: { created_at: 'DESC' },
    });
  }

  async create(
    data: { student_name: string; reason: string; week_start?: string },
    userId: number,
  ): Promise<Penalty> {
    const weekStart =
      data.week_start ?? toDateOnlyString(weekStartFor(new Date()));
    const row = this.penaltiesRepo.create({
      student_name: data.student_name,
      reason: data.reason,
      week_start: weekStart,
      created_by: userId,
    });
    return this.penaltiesRepo.save(row);
  }

  async delete(id: number): Promise<void> {
    await this.penaltiesRepo.delete(id);
  }

  /** Monday for `new Date()` plus `offset` whole weeks. */
  weekStartForOffset(offset: number): string {
    const base = weekStartFor(new Date());
    const target = addDays(base, offset * 7);
    return toDateOnlyString(target);
  }
}
