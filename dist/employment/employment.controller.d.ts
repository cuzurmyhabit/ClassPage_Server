import { EmploymentService } from './employment.service';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { User } from '../entities/user.entity';
export declare class EmploymentController {
    private readonly employmentService;
    constructor(employmentService: EmploymentService);
    findAll(): Promise<import("../entities").EmploymentPost[]>;
    canManage(user: User): Promise<{
        canManage: boolean;
    }>;
    create(dto: CreateEmploymentDto, user: User): Promise<import("../entities").EmploymentPost>;
    delete(id: number, user: User): Promise<void>;
}
