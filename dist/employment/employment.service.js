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
exports.EmploymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employment_post_entity_1 = require("../entities/employment-post.entity");
const settings_service_1 = require("../settings/settings.service");
let EmploymentService = class EmploymentService {
    constructor(employmentRepo, settingsService) {
        this.employmentRepo = employmentRepo;
        this.settingsService = settingsService;
    }
    findAll() {
        return this.employmentRepo.find({
            relations: ['creator'],
            order: { created_at: 'DESC' },
        });
    }
    findRecent(limit = 3) {
        return this.employmentRepo.find({
            relations: ['creator'],
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
    async create(data, userId) {
        const post = this.employmentRepo.create({
            title: data.title,
            company: data.company,
            content: data.content,
            url: data.url ?? '',
            created_by: userId,
        });
        const saved = await this.employmentRepo.save(post);
        const withCreator = await this.employmentRepo.findOne({
            where: { id: saved.id },
            relations: ['creator'],
        });
        return withCreator;
    }
    async assertCanManageEmployment(userId, role) {
        if (role === 'admin' || role === 'teacher')
            return;
        const designated = await this.settingsService.get('employment_manager_user_id');
        if (!designated) {
            throw new common_1.ForbiddenException('취업 정보 등록 권한이 없습니다. 관리자에게 지정 담당자 설정을 요청하세요.');
        }
        if (String(userId) !== designated.trim()) {
            throw new common_1.ForbiddenException('취업 정보 등록/삭제 권한이 없습니다.');
        }
    }
    async delete(id) {
        const result = await this.employmentRepo.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException();
        }
    }
};
exports.EmploymentService = EmploymentService;
exports.EmploymentService = EmploymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employment_post_entity_1.EmploymentPost)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        settings_service_1.SettingsService])
], EmploymentService);
//# sourceMappingURL=employment.service.js.map