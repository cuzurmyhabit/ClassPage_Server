import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
export type ImportEventInput = {
    title: string;
    description?: string;
    event_date: string;
};
export type ImportEventsSummary = {
    added: number;
    deleted: number;
    skipped: number;
    focus_month: string;
};
export type UpcomingEventItem = Event & {
    days_left: number;
    is_today: boolean;
};
export declare class EventsService {
    private readonly eventRepo;
    constructor(eventRepo: Repository<Event>);
    findUpcoming(limit?: number): Promise<Event[]>;
    findUpcomingWithCountdown(limit?: number): Promise<UpcomingEventItem[]>;
    findByMonth(year: number, month: number): Promise<Event[]>;
    create(data: {
        title: string;
        description?: string;
        event_date: string;
    }, userId: number): Promise<Event>;
    update(id: number, data: {
        title?: string;
        description?: string;
        event_date?: string;
    }): Promise<Event>;
    delete(id: number): Promise<void>;
    importEvents(events: ImportEventInput[], userId: number, replaceExisting: boolean): Promise<ImportEventsSummary>;
}
