import { Repository } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';
export declare class AnnouncementsService {
    private readonly announcementsRepo;
    constructor(announcementsRepo: Repository<Announcement>);
    findRecent(limit?: number): Promise<Announcement[]>;
    create(data: {
        title: string;
        content: string;
    }, userId: number): Promise<Announcement>;
    delete(id: number): Promise<void>;
}
