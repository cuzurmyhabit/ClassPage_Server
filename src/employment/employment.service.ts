import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmploymentPost } from '../entities/employment-post.entity';

@Injectable()
export class EmploymentService {
  constructor(
    @InjectRepository(EmploymentPost)
    private readonly employmentRepo: Repository<EmploymentPost>,
  ) {}

  findAll(): Promise<EmploymentPost[]> {
    return this.employmentRepo.find({
      relations: ['creator'],
      order: { created_at: 'DESC' },
    });
  }

  findRecent(limit = 3): Promise<EmploymentPost[]> {
    return this.employmentRepo.find({
      relations: ['creator'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async create(
    data: { title: string; company: string; content: string; url?: string },
    userId: number,
  ): Promise<EmploymentPost> {
    const post = this.employmentRepo.create({
      title: data.title,
      company: data.company,
      content: data.content,
      url: data.url ?? '',
      created_by: userId,
    });
    const saved = await this.employmentRepo.save(post);
    const withCreator = await this.employmentRepo.findOne({
      where: { id: saved.id },
      relations: ['creator'],
    });
    return withCreator!;
  }

  async delete(id: number): Promise<void> {
    const result = await this.employmentRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException();
    }
  }
}
