"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../entities/event.entity");
function todayIsoDate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function eventKey(title, event_date) {
    return `${title}\0${event_date}`;
}
function lastDayOfMonth(year, month1to12) {
    return new Date(year, month1to12, 0).getDate();
}
function focusMonthFromDate(eventDate) {
    const [y, m] = eventDate.split('-').map(Number);
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-01`;
}
function daysFromToday(eventDate) {
    const today = new Date(todayIsoDate() + 'T00:00:00');
    const target = new Date(eventDate + 'T00:00:00');
    const diffMs = target.getTime() - today.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
let EventsService = class EventsService {
    constructor(eventRepo) {
        this.eventRepo = eventRepo;
    }
    findUpcoming(limit = 5) {
        const today = todayIsoDate();
        return this.eventRepo.find({
            where: { event_date: (0, typeorm_2.Between)(today, '9999-12-31') },
            relations: ['creator'],
            order: { event_date: 'ASC' },
            take: limit,
        });
    }
    async findUpcomingWithCountdown(limit = 5) {
        const events = await this.findUpcoming(limit);
        return events.map((event) => {
            const daysLeft = daysFromToday(event.event_date);
            return Object.assign(event, {
                days_left: daysLeft,
                is_today: daysLeft === 0,
            });
        });
    }
    findByMonth(year, month) {
        const m = String(month).padStart(2, '0');
        const start = `${year}-${m}-01`;
        const endDay = lastDayOfMonth(year, month);
        const end = `${year}-${m}-${String(endDay).padStart(2, '0')}`;
        return this.eventRepo.find({
            where: { event_date: (0, typeorm_2.Between)(start, end) },
            relations: ['creator'],
            order: { event_date: 'ASC' },
        });
    }
    async create(data, userId) {
        const event = this.eventRepo.create({
            title: data.title,
            description: data.description ?? '',
            event_date: data.event_date,
            created_by: userId,
        });
        return this.eventRepo.save(event);
    }
    async update(id, data) {
        const event = await this.eventRepo.findOneBy({ id });
        if (!event) {
            throw new common_1.NotFoundException();
        }
        if (data.title !== undefined)
            event.title = data.title;
        if (data.description !== undefined)
            event.description = data.description;
        if (data.event_date !== undefined)
            event.event_date = data.event_date;
        return this.eventRepo.save(event);
    }
    async delete(id) {
        const result = await this.eventRepo.delete({ id });
        if (!result.affected) {
            throw new common_1.NotFoundException();
        }
    }
    async importEvents(events, userId, replaceExisting) {
        if (!events?.length) {
            throw new common_1.BadRequestException('불러올 일정이 없습니다.');
        }
        const sorted = [...events].sort((a, b) => {
            const d = a.event_date.localeCompare(b.event_date);
            if (d !== 0)
                return d;
            return a.title.localeCompare(b.title);
        });
        const normalized = [];
        const seenKeys = new Set();
        for (const item of sorted) {
            const key = eventKey(item.title, item.event_date);
            if (seenKeys.has(key))
                continue;
            seenKeys.add(key);
            normalized.push({
                title: item.title,
                description: item.description ?? '',
                event_date: item.event_date,
            });
        }
        const startDate = normalized[0].event_date;
        const endDate = normalized[normalized.length - 1].event_date;
        return this.eventRepo.manager.transaction(async (em) => {
            const repo = em.getRepository(event_entity_1.Event);
            let deleted = 0;
            let existingKeys = new Set();
            if (replaceExisting) {
                const existing = await repo.find({
                    where: { event_date: (0, typeorm_2.Between)(startDate, endDate) },
                });
                deleted = existing.length;
                if (existing.length) {
                    await repo.remove(existing);
                }
            }
            else {
                const existingRows = await repo.find({
                    where: { event_date: (0, typeorm_2.Between)(startDate, endDate) },
                    select: ['title', 'event_date'],
                });
                existingKeys = new Set(existingRows.map((r) => eventKey(r.title, r.event_date)));
            }
            let added = 0;
            let skipped = 0;
            for (const item of normalized) {
                const key = eventKey(item.title, item.event_date);
                if (existingKeys.has(key)) {
                    skipped += 1;
                    continue;
                }
                await repo.save(repo.create({
                    title: item.title,
                    description: item.description ?? '',
                    event_date: item.event_date,
                    created_by: userId,
                }));
                existingKeys.add(key);
                added += 1;
            }
            return {
                added,
                deleted,
                skipped,
                focus_month: focusMonthFromDate(startDate),
            };
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map