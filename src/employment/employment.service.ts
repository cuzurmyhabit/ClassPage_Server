import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmploymentPost } from '../entities/employment-post.entity';
import { SettingsService } from '../settings/settings.service';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class EmploymentService {
  constructor(
    @InjectRepository(EmploymentPost)
    private readonly employmentRepo: Repository<EmploymentPost>,
    private readonly settingsService: SettingsService,
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

  async assertCanManageEmployment(userId: number, role: UserRole): Promise<void> {
    if (role === 'admin' || role === 'teacher') return;
    const designated = await this.settingsService.get('employment_manager_user_id');
    if (!designated) {
      throw new ForbiddenException(
        '취업 정보 등록 권한이 없습니다. 관리자에게 지정 담당자 설정을 요청하세요.',
      );
    }
    if (String(userId) !== designated.trim()) {
      throw new ForbiddenException('취업 정보 등록/삭제 권한이 없습니다.');
    }
  }

  async delete(id: number): Promise<void> {
    const result = await this.employmentRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException();
    }
  }
}
