import { PenaltiesService } from './penalties.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { User } from '../entities/user.entity';
export declare class PenaltiesController {
    private readonly penaltiesService;
    constructor(penaltiesService: PenaltiesService);
    findByWeek(offset: number): Promise<{
        penalties: import("../entities").Penalty[];
        weekStart: string;
        prevOffset: number;
        nextOffset: number;
    }>;
    findThisWeek(): Promise<{
        penalties: import("../entities").Penalty[];
        weekStart: string;
    }>;
    create(dto: CreatePenaltyDto, user: User): Promise<import("../entities").Penalty>;
    delete(id: number): Promise<void>;
}
