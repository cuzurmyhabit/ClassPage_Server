import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentsRepo: Repository<Assignment>,
  ) {}

  private baseOrderedQuery() {
    return this.assignmentsRepo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.creator', 'creator')
      .orderBy(
        'CASE WHEN assignment.due_at IS NULL THEN 1 ELSE 0 END',
        'ASC',
      )
      .addOrderBy('assignment.due_at', 'ASC')
      .addOrderBy('assignment.created_at', 'DESC');
  }

  findAll(): Promise<Assignment[]> {
    return this.baseOrderedQuery().getMany();
  }

  findRecent(limit = 4): Promise<Assignment[]> {
    return this.baseOrderedQuery().take(limit).getMany();
  }

  private parseDueAt(
    due_at: string | null | undefined,
  ): Date | null {
    if (due_at === undefined || due_at === null || due_at === '') {
      return null;
    }
    return new Date(due_at);
  }

  async create(dto: CreateAssignmentDto, userId: number): Promise<Assignment> {
    const description = dto.description ?? '';
    const due_at = this.parseDueAt(dto.due_at);
    const row = this.assignmentsRepo.create({
      title: dto.title,
      description,
      due_at,
      created_by: userId,
    });
    return this.assignmentsRepo.save(row);
  }

  async delete(id: number): Promise<void> {
    await this.assignmentsRepo.delete(id);
  }
}
