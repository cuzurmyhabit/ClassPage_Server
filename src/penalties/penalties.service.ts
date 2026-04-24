import { Injectable, NotFoundException } from '@nestjs/common';
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

  /** UI 전체 탭·대시보드용: 최근 패널티 (클래스 규모 기준 상한) */
  findRecent(limit = 500): Promise<Penalty[]> {
    return this.penaltiesRepo.find({
      relations: ['creator'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async create(
    data: {
      student_name: string;
      reason: string;
      week_start?: string;
      start_date?: string;
      end_date?: string;
    },
    userId: number,
  ): Promise<Penalty> {
    const startDate =
      data.start_date ??
      data.week_start ??
      toDateOnlyString(weekStartFor(new Date()));
    const weekStart = data.week_start ?? startDate;
    const row = this.penaltiesRepo.create({
      student_name: data.student_name,
      reason: data.reason,
      week_start: weekStart,
      start_date: startDate,
      end_date: data.end_date ?? null,
      status: 'open',
      created_by: userId,
    });
    return this.penaltiesRepo.save(row);
  }

  async delete(id: number): Promise<void> {
    const result = await this.penaltiesRepo.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException();
    }
  }

  async update(
    id: number,
    data: {
      student_name?: string;
      reason?: string;
      start_date?: string;
      end_date?: string;
      status?: 'open' | 'resolved' | 'waived';
    },
  ): Promise<Penalty> {
    const row = await this.penaltiesRepo.findOneBy({ id });
    if (!row) {
      throw new NotFoundException();
    }
    if (data.student_name !== undefined) row.student_name = data.student_name;
    if (data.reason !== undefined) row.reason = data.reason;
    if (data.start_date !== undefined) {
      row.start_date = data.start_date;
      row.week_start = data.start_date;
    }
    if (data.end_date !== undefined) {
      row.end_date = data.end_date === '' ? null : data.end_date;
    }
    if (data.status !== undefined) row.status = data.status;
    return this.penaltiesRepo.save(row);
  }

  /** Monday for `new Date()` plus `offset` whole weeks. */
  weekStartForOffset(offset: number): string {
    const base = weekStartFor(new Date());
    const target = addDays(base, offset * 7);
    return toDateOnlyString(target);
  }
}
