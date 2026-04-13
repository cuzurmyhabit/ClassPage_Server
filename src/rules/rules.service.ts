import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from '../entities/rule.entity';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule)
    private readonly rulesRepo: Repository<Rule>,
  ) {}

  findAll(): Promise<Rule[]> {
    return this.rulesRepo.find({
      order: { position: 'ASC', id: 'ASC' },
    });
  }

  async create(content: string): Promise<Rule> {
    const last = await this.rulesRepo.find({
      order: { position: 'DESC', id: 'DESC' },
      take: 1,
    });
    const max = last[0]?.position ?? -1;
    const row = this.rulesRepo.create({
      content,
      position: max + 1,
    });
    return this.rulesRepo.save(row);
  }

  async delete(id: number): Promise<void> {
    await this.rulesRepo.delete(id);
  }
}
