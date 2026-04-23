import { User } from './user.entity';
export declare class Announcement {
    id: number;
    title: string;
    content: string;
    created_by: number;
    creator: User;
    created_at: Date;
}
