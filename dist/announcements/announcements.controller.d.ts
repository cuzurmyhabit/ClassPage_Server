import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { User } from '../entities/user.entity';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
    findRecent(): Promise<import("../entities").Announcement[]>;
    create(dto: CreateAnnouncementDto, user: User): Promise<import("../entities").Announcement>;
    delete(id: number): Promise<void>;
}
