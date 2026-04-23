import { AdminService } from './admin.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAdminData(): Promise<{
        users: {
            id: number;
            username: string;
            name: string;
            role: import("../entities/user.entity").UserRole;
            created_at: Date;
        }[];
        settings: Record<string, string>;
        office_options: typeof import("./admin.service").OFFICE_OPTIONS;
    }>;
    updateSettings(body: UpdateSettingsDto): Promise<void>;
    createUser(body: CreateUserDto): Promise<{
        id: number;
        username: string;
        name: string;
        role: import("../entities/user.entity").UserRole;
        created_at: Date;
    }>;
    searchSchools(officeCode: string, query: string): Promise<{
        office_code: string;
        office_name: string;
        school_code: string;
        school_name: string;
        school_type: string;
        address: string;
    }[]>;
}
