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

    if (user.must_change_password) {
      return {
        requires_password_change: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      };
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      requires_password_change: false,
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async changePassword(username: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepo.findOneBy({ username });
    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 맞지 않습니다.');
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 맞지 않습니다.');
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.must_change_password = false;
    await this.usersRepo.save(user);

    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      requires_password_change: false,
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
    requires_password_change: boolean;
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
        must_change_password: false,
      }),
    );

    const created = await this.usersRepo.findOneBy({ username });
    if (!created) {
      throw new UnauthorizedException('초기 관리자 생성에 실패했습니다.');
    }
    const payload = {
      sub: created.id,
      username: created.username,
      role: created.role,
    };
    return {
      requires_password_change: false,
      access_token: this.jwtService.sign(payload),
      user: {
        id: created.id,
        username: created.username,
        name: created.name,
        role: created.role,
      },
    };
  }
}
