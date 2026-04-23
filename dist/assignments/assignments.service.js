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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assignment_entity_1 = require("../entities/assignment.entity");
let AssignmentsService = class AssignmentsService {
    constructor(assignmentsRepo) {
        this.assignmentsRepo = assignmentsRepo;
    }
    baseOrderedQuery() {
        return this.assignmentsRepo
            .createQueryBuilder('assignment')
            .leftJoinAndSelect('assignment.creator', 'creator')
            .orderBy('CASE WHEN assignment.due_at IS NULL THEN 1 ELSE 0 END', 'ASC')
            .addOrderBy('assignment.due_at', 'ASC')
            .addOrderBy('assignment.created_at', 'DESC');
    }
    findAll() {
        return this.baseOrderedQuery().getMany();
    }
    findRecent(limit = 4) {
        return this.baseOrderedQuery().take(limit).getMany();
    }
    parseDueAt(due_at) {
        if (due_at === undefined || due_at === null || due_at === '') {
            return null;
        }
        return new Date(due_at);
    }
    async create(dto, userId) {
        const description = dto.description ?? '';
        const due_at = this.parseDueAt(dto.due_at);
        const row = this.assignmentsRepo.create({
            title: dto.title,
            description,
            due_at,
            created_by: userId,
        });
        return this.assignmentsRepo.save(row);
    }
    async delete(id) {
        await this.assignmentsRepo.delete(id);
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map