import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
export declare class AssignmentsService {
    private readonly assignmentsRepo;
    constructor(assignmentsRepo: Repository<Assignment>);
    private baseOrderedQuery;
    findAll(): Promise<Assignment[]>;
    findRecent(limit?: number): Promise<Assignment[]>;
    private parseDueAt;
    create(dto: CreateAssignmentDto, userId: number): Promise<Assignment>;
    delete(id: number): Promise<void>;
}
