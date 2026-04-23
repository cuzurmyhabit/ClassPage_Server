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
exports.MealsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const meals_service_1 = require("./meals.service");
let MealsController = class MealsController {
    constructor(mealsService) {
        this.mealsService = mealsService;
    }
    async getTodayMeal(refresh) {
        const force = refresh === '1' ||
            refresh === 'true' ||
            refresh === 'yes';
        const today = new Date();
        const content = await this.mealsService.getMealForDate(today, force);
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        return { date: `${y}-${m}-${d}`, content };
    }
    getMealsForWeek(offset, refresh) {
        const o = offset !== undefined && offset !== '' ? Number(offset) : 0;
        const force = refresh === '1' ||
            refresh === 'true' ||
            refresh === 'yes';
        return this.mealsService.getMealsForWeek(Number.isFinite(o) ? o : 0, force);
    }
};
exports.MealsController = MealsController;
__decorate([
    (0, common_1.Get)('today'),
    __param(0, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MealsController.prototype, "getTodayMeal", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('offset')),
    __param(1, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MealsController.prototype, "getMealsForWeek", null);
exports.MealsController = MealsController = __decorate([
    (0, common_1.Controller)('meals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [meals_service_1.MealsService])
], MealsController);
//# sourceMappingURL=meals.controller.js.map