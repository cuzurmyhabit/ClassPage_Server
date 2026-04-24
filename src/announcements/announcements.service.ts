import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementsRepo: Repository<Announcement>,
  ) {}

  findRecent(limit = 5): Promise<Announcement[]> {
    return this.announcementsRepo.find({
      relations: ['creator'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async create(
    data: { title: string; content: string },
    userId: number,
  ): Promise<Announcement> {
    const row = this.announcementsRepo.create({
      title: data.title,
      content: data.content,
      created_by: userId,
    });
    return this.announcementsRepo.save(row);
  }

  async delete(id: number): Promise<void> {
    const result = await this.announcementsRepo.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException();
    }
  }

  async update(
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Announcement> {
    const row = await this.announcementsRepo.findOneBy({ id });
    if (!row) {
      throw new NotFoundException();
    }
    if (data.title !== undefined) row.title = data.title;
    if (data.content !== undefined) row.content = data.content;
    return this.announcementsRepo.save(row);
  }
}
