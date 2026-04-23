import { User } from './user.entity';
export declare class EmploymentPost {
    id: number;
    title: string;
    company: string;
    content: string;
    url: string;
    created_by: number;
    creator: User;
    created_at: Date;
}
