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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("../entities/setting.entity");
const DEFAULT_SETTINGS = {
    school_name: '학급 운영 홈',
    class_name: '3학년 1반',
    office_code: '',
    office_name: '',
    school_code: '',
    school_display_name: '',
    schedule_source: 'pdf',
    employment_manager_user_id: '',
};
let SettingsService = class SettingsService {
    constructor(settingsRepo) {
        this.settingsRepo = settingsRepo;
    }
    async loadAll() {
        const rows = await this.settingsRepo.find();
        const fromDb = {};
        for (const row of rows) {
            fromDb[row.key] = row.value;
        }
        return { ...DEFAULT_SETTINGS, ...fromDb };
    }
    async get(key) {
        const all = await this.loadAll();
        return all[key] ?? '';
    }
    async save(key, value) {
        const existing = await this.settingsRepo.findOneBy({ key });
        if (existing) {
            existing.value = value;
            await this.settingsRepo.save(existing);
        }
        else {
            await this.settingsRepo.save(this.settingsRepo.create({ key, value }));
        }
    }
    async saveMany(entries) {
        for (const [key, value] of Object.entries(entries)) {
            await this.save(key, value);
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map