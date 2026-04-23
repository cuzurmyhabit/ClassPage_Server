import { User } from './user.entity';
export declare class Portfolio {
    id: number;
    student_id: number;
    student: User;
    title: string;
    summary: string;
    content: string;
    link: string;
    updated_at: Date;
}
