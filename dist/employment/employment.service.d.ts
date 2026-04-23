import { Repository } from 'typeorm';
import { EmploymentPost } from '../entities/employment-post.entity';
import { SettingsService } from '../settings/settings.service';
import { UserRole } from '../entities/user.entity';
export declare class EmploymentService {
    private readonly employmentRepo;
    private readonly settingsService;
    constructor(employmentRepo: Repository<EmploymentPost>, settingsService: SettingsService);
    findAll(): Promise<EmploymentPost[]>;
    findRecent(limit?: number): Promise<EmploymentPost[]>;
    create(data: {
        title: string;
        company: string;
        content: string;
        url?: string;
    }, userId: number): Promise<EmploymentPost>;
    assertCanManageEmployment(userId: number, role: UserRole): Promise<void>;
    delete(id: number): Promise<void>;
}
