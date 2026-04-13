import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepo.find({ order: { created_at: 'ASC' } });
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  async create(data: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
  }): Promise<User> {
    const existing = await this.usersRepo.findOneBy({
      username: data.username,
    });
    if (existing) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }
    const password_hash = await bcrypt.hash(data.password, 10);
    const user = this.usersRepo.create({
      username: data.username,
      password_hash,
      name: data.name,
      role: data.role,
    });
    return this.usersRepo.save(user);
  }
}
