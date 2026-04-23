import { Repository } from 'typeorm';
import { Penalty } from '../entities/penalty.entity';
export declare function weekStartFor(d: Date): Date;
export declare class PenaltiesService {
    private readonly penaltiesRepo;
    constructor(penaltiesRepo: Repository<Penalty>);
    findByWeek(weekStart: string): Promise<Penalty[]>;
    create(data: {
        student_name: string;
        reason: string;
        week_start?: string;
    }, userId: number): Promise<Penalty>;
    delete(id: number): Promise<void>;
    weekStartForOffset(offset: number): string;
}
