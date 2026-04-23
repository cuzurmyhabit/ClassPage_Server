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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const create_event_dto_1 = require("./dto/create-event.dto");
const import_events_dto_1 = require("./dto/import-events.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const events_service_1 = require("./events.service");
function parseYearMonth(monthParam) {
    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
        throw new common_1.BadRequestException('month 쿼리는 YYYY-MM 형식이어야 합니다.');
    }
    const [y, m] = monthParam.split('-').map((s) => parseInt(s, 10));
    if (m < 1 || m > 12) {
        throw new common_1.BadRequestException('유효하지 않은 월입니다.');
    }
    return { year: y, month: m };
}
let EventsController = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    findByMonth(month) {
        if (!month) {
            throw new common_1.BadRequestException('month 쿼리(YYYY-MM)가 필요합니다.');
        }
        const { year, month: m } = parseYearMonth(month);
        return this.eventsService.findByMonth(year, m);
    }
    findUpcoming(limit) {
        const n = limit !== undefined ? parseInt(limit, 10) : 5;
        const lim = Number.isFinite(n) && n > 0 ? n : 5;
        return this.eventsService.findUpcomingWithCountdown(lim);
    }
    async findHeadline() {
        const rows = await this.eventsService.findUpcomingWithCountdown(1);
        return rows[0] ?? null;
    }
    create(dto, user) {
        return this.eventsService.create({
            title: dto.title,
            description: dto.description ?? '',
            event_date: dto.event_date,
        }, user.id);
    }
    update(id, dto) {
        return this.eventsService.update(id, dto);
    }
    async remove(id) {
        await this.eventsService.delete(id);
        return { ok: true };
    }
    importEvents(body, user) {
        return this.eventsService.importEvents(body.events.map((e) => ({
            title: e.title,
            description: e.description ?? '',
            event_date: e.event_date,
        })), user.id, body.replaceExisting);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findByMonth", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findUpcoming", null);
__decorate([
    (0, common_1.Get)('headline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findHeadline", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_events_dto_1.ImportEventsDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "importEvents", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map