import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../entities/user.entity';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

export const OFFICE_OPTIONS = [
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
] as const;

type UserWithoutPassword = Omit<User, 'password_hash'>;

function normalizeSchoolRows(
  row: unknown,
): Record<string, unknown>[] {
  if (Array.isArray(row)) return row as Record<string, unknown>[];
  if (row && typeof row === 'object') return [row as Record<string, unknown>];
  return [];
}

function parseNeisSchoolList(payload: unknown): {
  office_code: string;
  office_name: string;
  school_code: string;
  school_name: string;
  school_type: string;
  address: string;
}[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  const block = root.schoolInfo;
  if (!Array.isArray(block) || block.length < 2) return [];
  const dataPart = block[1] as Record<string, unknown> | undefined;
  if (!dataPart || dataPart.row === undefined) return [];
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

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly settingsService: SettingsService,
  ) {}

  async getAdminData(): Promise<{
    users: UserWithoutPassword[];
    settings: Record<string, string>;
    office_options: typeof OFFICE_OPTIONS;
  }> {
    const users = await this.usersService.findAll();
    const sanitized = users.map(
      ({ password_hash: _p, ...rest }): UserWithoutPassword => rest,
    );
    const settings = await this.settingsService.loadAll();
    return {
      users: sanitized,
      settings,
      office_options: OFFICE_OPTIONS,
    };
  }

  async updateSettings(data: UpdateSettingsDto): Promise<void> {
    const entries: Record<string, string> = {};
    const keys = [
      'school_name',
      'class_name',
      'office_code',
      'office_name',
      'school_code',
      'school_display_name',
      'schedule_source',
      'employment_manager_user_id',
    ] as const;
    for (const k of keys) {
      const v = data[k];
      if (v !== undefined) entries[k] = v;
    }
    await this.settingsService.saveMany(entries);
  }

  async createUser(data: CreateUserDto): Promise<UserWithoutPassword> {
    const user = await this.usersService.create({
      username: data.username,
      password: data.password,
      name: data.name,
      role: data.role as UserRole,
    });
    const { password_hash: _p, ...rest } = user;
    return rest;
  }

  async searchSchools(
    officeCode: string,
    query: string,
  ): Promise<
    {
      office_code: string;
      office_name: string;
      school_code: string;
      school_name: string;
      school_type: string;
      address: string;
    }[]
  > {
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
      let payload: unknown;
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        return [];
      }
      return parseNeisSchoolList(payload);
    } catch {
      return [];
    }
  }
}
