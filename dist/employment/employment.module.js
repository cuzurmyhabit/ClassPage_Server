"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmploymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const employment_post_entity_1 = require("../entities/employment-post.entity");
const employment_service_1 = require("./employment.service");
const employment_controller_1 = require("./employment.controller");
const settings_module_1 = require("../settings/settings.module");
let EmploymentModule = class EmploymentModule {
};
exports.EmploymentModule = EmploymentModule;
exports.EmploymentModule = EmploymentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([employment_post_entity_1.EmploymentPost]), settings_module_1.SettingsModule],
        controllers: [employment_controller_1.EmploymentController],
        providers: [employment_service_1.EmploymentService],
        exports: [employment_service_1.EmploymentService],
    })
], EmploymentModule);
//# sourceMappingURL=employment.module.js.map