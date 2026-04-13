import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Event } from '../entities/event.entity';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function eventKey(title: string, event_date: string): string {
  return `${title}\0${event_date}`;
}

function lastDayOfMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

function focusMonthFromDate(eventDate: string): string {
  const [y, m] = eventDate.split('-').map(Number);
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-01`;
}

export type ImportEventInput = {
  title: string;
  description?: string;
  event_date: string;
};

export type ImportEventsSummary = {
  added: number;
  deleted: number;
  skipped: number;
  focus_month: string;
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  findUpcoming(limit = 5): Promise<Event[]> {
    const today = todayIsoDate();
    return this.eventRepo.find({
      where: { event_date: Between(today, '9999-12-31') },
      relations: ['creator'],
      order: { event_date: 'ASC' },
      take: limit,
    });
  }

  findByMonth(year: number, month: number): Promise<Event[]> {
    const m = String(month).padStart(2, '0');
    const start = `${year}-${m}-01`;
    const endDay = lastDayOfMonth(year, month);
    const end = `${year}-${m}-${String(endDay).padStart(2, '0')}`;
    return this.eventRepo.find({
      where: { event_date: Between(start, end) },
      relations: ['creator'],
      order: { event_date: 'ASC' },
    });
  }

  async create(
    data: { title: string; description?: string; event_date: string },
    userId: number,
  ): Promise<Event> {
    const event = this.eventRepo.create({
      title: data.title,
      description: data.description ?? '',
      event_date: data.event_date,
      created_by: userId,
    });
    return this.eventRepo.save(event);
  }

  async update(
    id: number,
    data: { title?: string; description?: string; event_date?: string },
  ): Promise<Event> {
    const event = await this.eventRepo.findOneBy({ id });
    if (!event) {
      throw new NotFoundException();
    }
    if (data.title !== undefined) event.title = data.title;
    if (data.description !== undefined) event.description = data.description;
    if (data.event_date !== undefined) event.event_date = data.event_date;
    return this.eventRepo.save(event);
  }

  async delete(id: number): Promise<void> {
    const result = await this.eventRepo.delete({ id });
    if (!result.affected) {
      throw new NotFoundException();
    }
  }

  async importEvents(
    events: ImportEventInput[],
    userId: number,
    replaceExisting: boolean,
  ): Promise<ImportEventsSummary> {
    if (!events?.length) {
      throw new BadRequestException('불러올 일정이 없습니다.');
    }

    const sorted = [...events].sort((a, b) => {
      const d = a.event_date.localeCompare(b.event_date);
      if (d !== 0) return d;
      return a.title.localeCompare(b.title);
    });

    const normalized: ImportEventInput[] = [];
    const seenKeys = new Set<string>();
    for (const item of sorted) {
      const key = eventKey(item.title, item.event_date);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      normalized.push({
        title: item.title,
        description: item.description ?? '',
        event_date: item.event_date,
      });
    }

    const startDate = normalized[0].event_date;
    const endDate = normalized[normalized.length - 1].event_date;

    return this.eventRepo.manager.transaction(async (em) => {
      const repo = em.getRepository(Event);
      let deleted = 0;
      let existingKeys = new Set<string>();

      if (replaceExisting) {
        const existing = await repo.find({
          where: { event_date: Between(startDate, endDate) },
        });
        deleted = existing.length;
        if (existing.length) {
          await repo.remove(existing);
        }
      } else {
        const existingRows = await repo.find({
          where: { event_date: Between(startDate, endDate) },
          select: ['title', 'event_date'],
        });
        existingKeys = new Set(
          existingRows.map((r) => eventKey(r.title, r.event_date)),
        );
      }

      let added = 0;
      let skipped = 0;

      for (const item of normalized) {
        const key = eventKey(item.title, item.event_date);
        if (existingKeys.has(key)) {
          skipped += 1;
          continue;
        }
        await repo.save(
          repo.create({
            title: item.title,
            description: item.description ?? '',
            event_date: item.event_date,
            created_by: userId,
          }),
        );
        existingKeys.add(key);
        added += 1;
      }

      return {
        added,
        deleted,
        skipped,
        focus_month: focusMonthFromDate(startDate),
      };
    });
  }
}
