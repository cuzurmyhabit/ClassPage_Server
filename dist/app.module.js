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
const entities_1 = require("./entities");
const auth_module_1 = require("./auth/auth.module");
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
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST ?? '127.0.0.1',
                port: Number(process.env.DB_PORT ?? 3306),
                username: process.env.DB_USERNAME ?? 'classpage',
                password: process.env.DB_PASSWORD ?? 'classpage1234',
                database: process.env.DB_DATABASE ?? 'classpage',
                entities: [
                    entities_1.User,
                    entities_1.Event,
                    entities_1.EmploymentPost,
                    entities_1.Portfolio,
                    entities_1.Rule,
                    entities_1.Penalty,
                    entities_1.Announcement,
                    entities_1.Assignment,
                    entities_1.Setting,
                    entities_1.MealCache,
                ],
                synchronize: (process.env.DB_SYNC ?? 'false') === 'true',
            }),
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