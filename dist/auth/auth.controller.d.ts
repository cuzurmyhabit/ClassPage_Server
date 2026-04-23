import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { User } from '../entities/user.entity';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: import("../entities/user.entity").UserRole;
        };
    }>;
    bootstrapAdmin(dto: BootstrapAdminDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: string;
        };
    }>;
    me(user: User): {
        id: number;
        username: string;
        name: string;
        role: import("../entities/user.entity").UserRole;
    };
}
