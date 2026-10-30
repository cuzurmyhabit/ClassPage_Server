"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const typeorm_config_1 = require("./typeorm.config");
const users_module_1 = require("./users/users.module");
const settings_module_1 = require("./settings/settings.module");
const employment_module_1 = require("./employment/employment.module");
const portfolios_module_1 = require("./portfolios/portfolios.module");
const rules_module_1 = require("./rules/rules.module");
const penalties_module_1 = require("./penalties/penalties.module");
const meals_module_1 = require("./meals/meals.module");
const events_module_1 = require("./events/events.module");
const assignments_module_1 = require("./assignments/assignments.module");
const announcements_module_1 = require("./announcements/announcements.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot((0, typeorm_config_1.buildTypeOrmOptions)()),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            settings_module_1.SettingsModule,
            employment_module_1.EmploymentModule,
            portfolios_module_1.PortfoliosModule,
            rules_module_1.RulesModule,
            penalties_module_1.PenaltiesModule,
            meals_module_1.MealsModule,
            events_module_1.EventsModule,
            assignments_module_1.AssignmentsModule,
            announcements_module_1.AnnouncementsModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map