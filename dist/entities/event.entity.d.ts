import { User } from './user.entity';
export declare class Event {
    id: number;
    title: string;
    description: string;
    event_date: string;
    created_by: number;
    creator: User;
    created_at: Date;
}
