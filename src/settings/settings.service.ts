import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';

const DEFAULT_SETTINGS: Record<string, string> = {
  school_name: '학급 운영 홈',
  class_name: '3학년 1반',
  office_code: '',
  office_name: '',
  school_code: '',
  school_display_name: '',
  schedule_source: 'pdf',
  employment_manager_user_id: '',
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
  ) {}

  async loadAll(): Promise<Record<string, string>> {
    const rows = await this.settingsRepo.find();
    const fromDb: Record<string, string> = {};
    for (const row of rows) {
      fromDb[row.key] = row.value;
    }
    return { ...DEFAULT_SETTINGS, ...fromDb };
  }

  async get(key: string): Promise<string> {
    const all = await this.loadAll();
    return all[key] ?? '';
  }

  async save(key: string, value: string): Promise<void> {
    const existing = await this.settingsRepo.findOneBy({ key });
    if (existing) {
      existing.value = value;
      await this.settingsRepo.save(existing);
    } else {
      await this.settingsRepo.save(
        this.settingsRepo.create({ key, value }),
      );
    }
  }

  async saveMany(entries: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      await this.save(key, value);
    }
  }
}
