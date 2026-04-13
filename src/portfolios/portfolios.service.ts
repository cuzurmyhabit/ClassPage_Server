import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

  findAll(): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      relations: ['student'],
      order: { updated_at: 'DESC' },
    });
  }

  findByStudent(studentId: number): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { student_id: studentId },
      relations: ['student'],
      order: { updated_at: 'DESC' },
    });
  }

  count(): Promise<number> {
    return this.portfolioRepo.count();
  }

  countByStudent(studentId: number): Promise<number> {
    return this.portfolioRepo.count({ where: { student_id: studentId } });
  }

  async create(
    data: {
      title: string;
      summary?: string;
      content: string;
      link?: string;
    },
    studentId: number,
  ): Promise<Portfolio> {
    const row = this.portfolioRepo.create({
      title: data.title,
      summary: data.summary ?? '',
      content: data.content,
      link: data.link ?? '',
      student_id: studentId,
    });
    const saved = await this.portfolioRepo.save(row);
    const withStudent = await this.portfolioRepo.findOne({
      where: { id: saved.id },
      relations: ['student'],
    });
    return withStudent!;
  }

  async delete(id: number, userId: number, userRole: UserRole): Promise<void> {
    const portfolio = await this.portfolioRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!portfolio) {
      throw new NotFoundException();
    }
    const isAdmin = userRole === 'admin';
    const isOwnerStudent =
      userRole === 'student' && portfolio.student_id === userId;
    if (!isAdmin && !isOwnerStudent) {
      throw new ForbiddenException();
    }
    await this.portfolioRepo.delete(id);
  }
}
