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
exports.PenaltiesController = void 0;
const common_1 = require("@nestjs/common");
const penalties_service_1 = require("./penalties.service");
const create_penalty_dto_1 = require("./dto/create-penalty.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
let PenaltiesController = class PenaltiesController {
    constructor(penaltiesService) {
        this.penaltiesService = penaltiesService;
    }
    async findByWeek(offset) {
        const weekStart = this.penaltiesService.weekStartForOffset(offset);
        const penalties = await this.penaltiesService.findByWeek(weekStart);
        return {
            penalties,
            weekStart,
            prevOffset: offset - 1,
            nextOffset: offset + 1,
        };
    }
    async findThisWeek() {
        const weekStart = this.penaltiesService.weekStartForOffset(0);
        const penalties = await this.penaltiesService.findByWeek(weekStart);
        return { penalties, weekStart };
    }
    create(dto, user) {
        return this.penaltiesService.create(dto, user.id);
    }
    delete(id) {
        return this.penaltiesService.delete(id);
    }
};
exports.PenaltiesController = PenaltiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PenaltiesController.prototype, "findByWeek", null);
__decorate([
    (0, common_1.Get)('this-week'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PenaltiesController.prototype, "findThisWeek", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_penalty_dto_1.CreatePenaltyDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PenaltiesController.prototype, "delete", null);
exports.PenaltiesController = PenaltiesController = __decorate([
    (0, common_1.Controller)('penalties'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [penalties_service_1.PenaltiesService])
], PenaltiesController);
//# sourceMappingURL=penalties.controller.js.map