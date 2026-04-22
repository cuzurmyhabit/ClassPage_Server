import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersRepo.findOneBy({ username });
    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 맞지 않습니다.');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 맞지 않습니다.');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async bootstrapAdmin(
    username: string,
    password: string,
    name: string,
  ): Promise<{
    access_token: string;
    user: {
      id: number;
      username: string;
      name: string;
      role: string;
    };
  }> {
    const userCount = await this.usersRepo.count();
    if (userCount > 0) {
      throw new ForbiddenException(
        '초기 관리자 생성은 사용자 정보가 비어 있을 때만 가능합니다.',
      );
    }

    const password_hash = await bcrypt.hash(password, 10);
    await this.usersRepo.save(
      this.usersRepo.create({
        username,
        password_hash,
        name,
        role: 'admin',
      }),
    );

    return this.login(username, password);
  }
}
