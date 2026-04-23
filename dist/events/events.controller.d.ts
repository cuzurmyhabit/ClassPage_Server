import { User } from '../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { ImportEventsDto } from './dto/import-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findByMonth(month: string): Promise<import("../entities").Event[]>;
    findUpcoming(limit?: string): Promise<import("./events.service").UpcomingEventItem[]>;
    findHeadline(): Promise<import("./events.service").UpcomingEventItem>;
    create(dto: CreateEventDto, user: User): Promise<import("../entities").Event>;
    update(id: number, dto: UpdateEventDto): Promise<import("../entities").Event>;
    remove(id: number): Promise<{
        ok: boolean;
    }>;
    importEvents(body: ImportEventsDto, user: User): Promise<import("./events.service").ImportEventsSummary>;
}
