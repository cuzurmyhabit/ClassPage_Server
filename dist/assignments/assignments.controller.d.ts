import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { User } from '../entities/user.entity';
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    findAll(): Promise<import("../entities").Assignment[]>;
    create(dto: CreateAssignmentDto, user: User): Promise<import("../entities").Assignment>;
    delete(id: number): Promise<void>;
}
