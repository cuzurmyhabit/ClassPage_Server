import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { UserRole } from '../entities/user.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';

const PDF_PREFIX = 'data:application/pdf';

function assertPdfDataUrl(file: {
  name: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}): void {
  if (typeof file.dataUrl !== 'string' || !file.dataUrl.startsWith(PDF_PREFIX)) {
    throw new BadRequestException('PDF data URL 형식만 허용됩니다.');
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new BadRequestException('파일 크기가 올바르지 않습니다.');
  }
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new BadRequestException('PDF는 10MB 이하만 업로드할 수 있습니다.');
  }
}

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

  async create(dto: CreatePortfolioDto, studentId: number): Promise<Portfolio> {
    if (!dto.resume && !dto.portfolio) {
      throw new BadRequestException(
        '이력서 또는 포트폴리오 PDF 중 최소 1개는 첨부해야 합니다.',
      );
    }
    if (dto.resume) assertPdfDataUrl(dto.resume);
    if (dto.portfolio) assertPdfDataUrl(dto.portfolio);

    const content = JSON.stringify({
      v: 1,
      resume: dto.resume ?? null,
      portfolio: dto.portfolio ?? null,
    });

    const row = this.portfolioRepo.create({
      title: dto.title,
      summary: dto.summary ?? '',
      content,
      link: dto.link ?? '',
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
