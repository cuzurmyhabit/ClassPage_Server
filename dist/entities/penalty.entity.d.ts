import { User } from './user.entity';
export declare class Penalty {
    id: number;
    student_name: string;
    reason: string;
    week_start: string;
    created_by: number;
    creator: User;
    created_at: Date;
}
