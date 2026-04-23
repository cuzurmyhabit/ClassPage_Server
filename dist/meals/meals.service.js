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
exports.MealsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meal_cache_entity_1 = require("../entities/meal-cache.entity");
const settings_service_1 = require("../settings/settings.service");
function formatYmd(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}
function toDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function startOfWeekMonday(ref) {
    const d = new Date(ref);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}
function parseNeisMealDish(payload) {
    if (!payload || typeof payload !== 'object')
        return null;
    const root = payload;
    const block = root.mealServiceDietInfo;
    if (!Array.isArray(block) || block.length < 2)
        return null;
    const dataPart = block[1];
    if (!dataPart || !Array.isArray(dataPart.row) || dataPart.row.length === 0) {
        return null;
    }
    const row0 = dataPart.row[0];
    const raw = row0.DDISH_NM;
    if (typeof raw !== 'string')
        return null;
    return raw.replace(/<br\s*\/?>/gi, '\n');
}
let MealsService = class MealsService {
    constructor(mealCacheRepo, settingsService) {
        this.mealCacheRepo = mealCacheRepo;
        this.settingsService = settingsService;
    }
    async getMealsForWeek(offset = 0, forceRefresh = false) {
        const monday = startOfWeekMonday(new Date());
        monday.setDate(monday.getDate() + offset * 7);
        const out = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const date = toDateKey(d);
            const content = await this.getMealForDate(date, forceRefresh);
            out.push({ date, content });
        }
        return out;
    }
    async getMealForDate(targetDate, forceRefresh) {
        const dateObj = typeof targetDate === 'string' ? new Date(targetDate + 'T12:00:00') : targetDate;
        const mealDate = toDateKey(dateObj);
        const settings = await this.settingsService.loadAll();
        const officeCode = (settings.office_code ?? '').trim();
        const schoolCode = (settings.school_code ?? '').trim();
        const missingCodesMessage = '관리자 페이지에서 교육청 코드와 학교 코드를 입력하면 급식을 자동으로 불러옵니다.';
        if (!officeCode || !schoolCode) {
            return missingCodesMessage;
        }
        if (!forceRefresh) {
            const cached = await this.mealCacheRepo.findOneBy({ meal_date: mealDate });
            if (cached) {
                return cached.content;
            }
        }
        const apiKey = process.env.NEIS_API_KEY ?? 'sample';
        const ymd = formatYmd(dateObj);
        const url = new URL('https://open.neis.go.kr/hub/mealServiceDietInfo');
        url.searchParams.set('KEY', apiKey);
        url.searchParams.set('Type', 'json');
        url.searchParams.set('ATPT_OFCDC_SC_CODE', officeCode);
        url.searchParams.set('SD_SCHUL_CODE', schoolCode);
        url.searchParams.set('MLSV_YMD', ymd);
        let content = '';
        try {
            const res = await fetch(url.toString());
            const text = await res.text();
            let payload;
            try {
                payload = JSON.parse(text);
            }
            catch {
                content = '급식 정보를 불러오지 못했습니다.';
                await this.cacheMeal(mealDate, content);
                return content;
            }
            const dish = parseNeisMealDish(payload);
            content =
                dish && dish.trim().length > 0
                    ? dish
                    : '해당 날짜의 급식 정보가 없습니다.';
        }
        catch {
            content = '급식 정보를 불러오지 못했습니다.';
        }
        await this.cacheMeal(mealDate, content);
        return content;
    }
    async cacheMeal(mealDate, content) {
        const existing = await this.mealCacheRepo.findOneBy({ meal_date: mealDate });
        const fetched_at = new Date();
        if (existing) {
            existing.content = content;
            existing.fetched_at = fetched_at;
            await this.mealCacheRepo.save(existing);
        }
        else {
            await this.mealCacheRepo.save(this.mealCacheRepo.create({ meal_date: mealDate, content, fetched_at }));
        }
    }
};
exports.MealsService = MealsService;
exports.MealsService = MealsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(meal_cache_entity_1.MealCache)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        settings_service_1.SettingsService])
], MealsService);
//# sourceMappingURL=meals.service.js.map