import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class AuthService {
    private usersRepo;
    private jwtService;
    constructor(usersRepo: Repository<User>, jwtService: JwtService);
    login(username: string, password: string): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: import("../entities/user.entity").UserRole;
        };
    }>;
    bootstrapAdmin(username: string, password: string, name: string): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: string;
        };
    }>;
}
