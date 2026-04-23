import { User } from './user.entity';
export declare class Assignment {
    id: number;
    title: string;
    description: string;
    due_at: Date | null;
    created_by: number;
    creator: User;
    created_at: Date;
}
