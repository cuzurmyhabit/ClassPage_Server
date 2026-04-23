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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = exports.OFFICE_OPTIONS = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("../settings/settings.service");
const users_service_1 = require("../users/users.service");
exports.OFFICE_OPTIONS = [
    { code: 'B10', name: '서울특별시교육청' },
    { code: 'C10', name: '부산광역시교육청' },
    { code: 'D10', name: '대구광역시교육청' },
    { code: 'E10', name: '인천광역시교육청' },
    { code: 'F10', name: '광주광역시교육청' },
    { code: 'G10', name: '대전광역시교육청' },
    { code: 'H10', name: '울산광역시교육청' },
    { code: 'I10', name: '세종특별자치시교육청' },
    { code: 'J10', name: '경기도교육청' },
    { code: 'K10', name: '강원특별자치도교육청' },
    { code: 'M10', name: '충청북도교육청' },
    { code: 'N10', name: '충청남도교육청' },
    { code: 'P10', name: '전북특별자치도교육청' },
    { code: 'Q10', name: '전라남도교육청' },
    { code: 'R10', name: '경상북도교육청' },
    { code: 'S10', name: '경상남도교육청' },
    { code: 'T10', name: '제주특별자치도교육청' },
];
function normalizeSchoolRows(row) {
    if (Array.isArray(row))
        return row;
    if (row && typeof row === 'object')
        return [row];
    return [];
}
function parseNeisSchoolList(payload) {
    if (!payload || typeof payload !== 'object')
        return [];
    const root = payload;
    const block = root.schoolInfo;
    if (!Array.isArray(block) || block.length < 2)
        return [];
    const dataPart = block[1];
    if (!dataPart || dataPart.row === undefined)
        return [];
    const rows = normalizeSchoolRows(dataPart.row);
    return rows.map((r) => ({
        office_code: String(r.ATPT_OFCDC_SC_CODE ?? ''),
        office_name: String(r.ATPT_OFCDC_SC_NM ?? ''),
        school_code: String(r.SD_SCHUL_CODE ?? ''),
        school_name: String(r.SCHUL_NM ?? ''),
        school_type: String(r.SCHUL_KND_SC_NM ?? r.HS_SC_NM ?? ''),
        address: String(r.ORG_RDNMA ?? r.ORG_RDNDA ?? r.DDDEP_NM ?? ''),
    }));
}
let AdminService = class AdminService {
    constructor(usersService, settingsService) {
        this.usersService = usersService;
        this.settingsService = settingsService;
    }
    async getAdminData() {
        const users = await this.usersService.findAll();
        const sanitized = users.map(({ password_hash: _p, ...rest }) => rest);
        const settings = await this.settingsService.loadAll();
        return {
            users: sanitized,
            settings,
            office_options: exports.OFFICE_OPTIONS,
        };
    }
    async updateSettings(data) {
        const entries = {};
        const keys = [
            'school_name',
            'class_name',
            'office_code',
            'office_name',
            'school_code',
            'school_display_name',
            'schedule_source',
            'employment_manager_user_id',
        ];
        for (const k of keys) {
            const v = data[k];
            if (v !== undefined)
                entries[k] = v;
        }
        await this.settingsService.saveMany(entries);
    }
    async createUser(data) {
        const user = await this.usersService.create({
            username: data.username,
            password: data.password,
            name: data.name,
            role: data.role,
        });
        const { password_hash: _p, ...rest } = user;
        return rest;
    }
    async searchSchools(officeCode, query) {
        const apiKey = process.env.NEIS_API_KEY ?? 'sample';
        const url = new URL('https://open.neis.go.kr/hub/schoolInfo');
        url.searchParams.set('KEY', apiKey);
        url.searchParams.set('Type', 'json');
        url.searchParams.set('pIndex', '1');
        url.searchParams.set('pSize', '100');
        url.searchParams.set('ATPT_OFCDC_SC_CODE', officeCode);
        url.searchParams.set('SCHUL_NM', query);
        try {
            const res = await fetch(url.toString());
            const text = await res.text();
            let payload;
            try {
                payload = JSON.parse(text);
            }
            catch {
                return [];
            }
            return parseNeisSchoolList(payload);
        }
        catch {
            return [];
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        settings_service_1.SettingsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map