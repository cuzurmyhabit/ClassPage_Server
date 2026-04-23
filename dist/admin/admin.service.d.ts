import { User } from '../entities/user.entity';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare const OFFICE_OPTIONS: readonly [{
    readonly code: "B10";
    readonly name: "서울특별시교육청";
}, {
    readonly code: "C10";
    readonly name: "부산광역시교육청";
}, {
    readonly code: "D10";
    readonly name: "대구광역시교육청";
}, {
    readonly code: "E10";
    readonly name: "인천광역시교육청";
}, {
    readonly code: "F10";
    readonly name: "광주광역시교육청";
}, {
    readonly code: "G10";
    readonly name: "대전광역시교육청";
}, {
    readonly code: "H10";
    readonly name: "울산광역시교육청";
}, {
    readonly code: "I10";
    readonly name: "세종특별자치시교육청";
}, {
    readonly code: "J10";
    readonly name: "경기도교육청";
}, {
    readonly code: "K10";
    readonly name: "강원특별자치도교육청";
}, {
    readonly code: "M10";
    readonly name: "충청북도교육청";
}, {
    readonly code: "N10";
    readonly name: "충청남도교육청";
}, {
    readonly code: "P10";
    readonly name: "전북특별자치도교육청";
}, {
    readonly code: "Q10";
    readonly name: "전라남도교육청";
}, {
    readonly code: "R10";
    readonly name: "경상북도교육청";
}, {
    readonly code: "S10";
    readonly name: "경상남도교육청";
}, {
    readonly code: "T10";
    readonly name: "제주특별자치도교육청";
}];
type UserWithoutPassword = Omit<User, 'password_hash'>;
export declare class AdminService {
    private readonly usersService;
    private readonly settingsService;
    constructor(usersService: UsersService, settingsService: SettingsService);
    getAdminData(): Promise<{
        users: UserWithoutPassword[];
        settings: Record<string, string>;
        office_options: typeof OFFICE_OPTIONS;
    }>;
    updateSettings(data: UpdateSettingsDto): Promise<void>;
    createUser(data: CreateUserDto): Promise<UserWithoutPassword>;
    searchSchools(officeCode: string, query: string): Promise<{
        office_code: string;
        office_name: string;
        school_code: string;
        school_name: string;
        school_type: string;
        address: string;
    }[]>;
}
export {};
