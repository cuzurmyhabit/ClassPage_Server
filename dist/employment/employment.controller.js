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
exports.EmploymentController = void 0;
const common_1 = require("@nestjs/common");
const employment_service_1 = require("./employment.service");
const create_employment_dto_1 = require("./dto/create-employment.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
let EmploymentController = class EmploymentController {
    constructor(employmentService) {
        this.employmentService = employmentService;
    }
    findAll() {
        return this.employmentService.findAll();
    }
    async canManage(user) {
        try {
            await this.employmentService.assertCanManageEmployment(user.id, user.role);
            return { canManage: true };
        }
        catch {
            return { canManage: false };
        }
    }
    async create(dto, user) {
        await this.employmentService.assertCanManageEmployment(user.id, user.role);
        return this.employmentService.create(dto, user.id);
    }
    async delete(id, user) {
        await this.employmentService.assertCanManageEmployment(user.id, user.role);
        return this.employmentService.delete(id);
    }
};
exports.EmploymentController = EmploymentController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmploymentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('permission'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], EmploymentController.prototype, "canManage", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employment_dto_1.CreateEmploymentDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], EmploymentController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], EmploymentController.prototype, "delete", null);
exports.EmploymentController = EmploymentController = __decorate([
    (0, common_1.Controller)('employment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [employment_service_1.EmploymentService])
], EmploymentController);
//# sourceMappingURL=employment.controller.js.map