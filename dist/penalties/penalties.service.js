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
exports.PenaltiesService = void 0;
exports.weekStartFor = weekStartFor;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const penalty_entity_1 = require("../entities/penalty.entity");
function weekStartFor(d) {
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
}
function toDateOnlyString(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function addDays(d, n) {
    const out = new Date(d);
    out.setDate(out.getDate() + n);
    return out;
}
let PenaltiesService = class PenaltiesService {
    constructor(penaltiesRepo) {
        this.penaltiesRepo = penaltiesRepo;
    }
    findByWeek(weekStart) {
        return this.penaltiesRepo.find({
            where: { week_start: weekStart },
            relations: ['creator'],
            order: { created_at: 'DESC' },
        });
    }
    async create(data, userId) {
        const weekStart = data.week_start ?? toDateOnlyString(weekStartFor(new Date()));
        const row = this.penaltiesRepo.create({
            student_name: data.student_name,
            reason: data.reason,
            week_start: weekStart,
            created_by: userId,
        });
        return this.penaltiesRepo.save(row);
    }
    async delete(id) {
        await this.penaltiesRepo.delete(id);
    }
    weekStartForOffset(offset) {
        const base = weekStartFor(new Date());
        const target = addDays(base, offset * 7);
        return toDateOnlyString(target);
    }
};
exports.PenaltiesService = PenaltiesService;
exports.PenaltiesService = PenaltiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(penalty_entity_1.Penalty)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PenaltiesService);
//# sourceMappingURL=penalties.service.js.map