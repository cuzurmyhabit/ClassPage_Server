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
exports.PortfoliosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const portfolio_entity_1 = require("../entities/portfolio.entity");
let PortfoliosService = class PortfoliosService {
    constructor(portfolioRepo) {
        this.portfolioRepo = portfolioRepo;
    }
    findAll() {
        return this.portfolioRepo.find({
            relations: ['student'],
            order: { updated_at: 'DESC' },
        });
    }
    findByStudent(studentId) {
        return this.portfolioRepo.find({
            where: { student_id: studentId },
            relations: ['student'],
            order: { updated_at: 'DESC' },
        });
    }
    count() {
        return this.portfolioRepo.count();
    }
    countByStudent(studentId) {
        return this.portfolioRepo.count({ where: { student_id: studentId } });
    }
    async create(data, studentId) {
        const row = this.portfolioRepo.create({
            title: data.title,
            summary: data.summary ?? '',
            content: data.content,
            link: data.link ?? '',
            student_id: studentId,
        });
        const saved = await this.portfolioRepo.save(row);
        const withStudent = await this.portfolioRepo.findOne({
            where: { id: saved.id },
            relations: ['student'],
        });
        return withStudent;
    }
    async delete(id, userId, userRole) {
        const portfolio = await this.portfolioRepo.findOne({
            where: { id },
            relations: ['student'],
        });
        if (!portfolio) {
            throw new common_1.NotFoundException();
        }
        const isAdmin = userRole === 'admin';
        const isOwnerStudent = userRole === 'student' && portfolio.student_id === userId;
        if (!isAdmin && !isOwnerStudent) {
            throw new common_1.ForbiddenException();
        }
        await this.portfolioRepo.delete(id);
    }
};
exports.PortfoliosService = PortfoliosService;
exports.PortfoliosService = PortfoliosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(portfolio_entity_1.Portfolio)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PortfoliosService);
//# sourceMappingURL=portfolios.service.js.map