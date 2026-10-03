import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealCache } from '../entities/meal-cache.entity';
import { SettingsService } from '../settings/settings.service';

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

type MealSectionJson = { dishes: string[]; kcal?: number };

type StructuredDayMeals = {
  breakfast?: MealSectionJson;
  lunch?: MealSectionJson;
  dinner?: MealSectionJson;
};

function splitDishes(raw: string): string[] {
  const text = raw.replace(/<br\s*\/?>/gi, '\n');
  return text
    .split('\n')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function parseKcal(calInfo: unknown): number | undefined {
  if (typeof calInfo !== 'string') return undefined;
  const m = calInfo.match(/([0-9]+(?:\.[0-9]+)?)\s*KCAL/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

function mealSlotFromName(name: unknown): keyof StructuredDayMeals | null {
  if (typeof name !== 'string') return null;
  const n = name.trim();
  if (/조식|아침/.test(n)) return 'breakfast';
  if (/중식|점심/.test(n)) return 'lunch';
  if (/석식|저녁/.test(n)) return 'dinner';
  return null;
}

/** 나이스 MMEAL_SC_CODE: 1 조식, 2 중식, 3 석식 */
function mealSlotFromCode(code: unknown): keyof StructuredDayMeals | null {
  const n =
    typeof code === 'number'
      ? code
      : typeof code === 'string'
        ? parseInt(code, 10)
        : NaN;
  if (n === 1) return 'breakfast';
  if (n === 2) return 'lunch';
  if (n === 3) return 'dinner';
  return null;
}

function parseNeisStructuredMeals(payload: unknown): StructuredDayMeals | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  const block = root.mealServiceDietInfo;
  if (!Array.isArray(block) || block.length < 2) return null;
  const dataPart = block[1] as Record<string, unknown> | undefined;
  if (!dataPart || dataPart.row === undefined) return null;

  const rows = Array.isArray(dataPart.row)
    ? (dataPart.row as Record<string, unknown>[])
    : [dataPart.row as Record<string, unknown>];

  const out: StructuredDayMeals = {};
  for (const row of rows) {
    const rawDish = row.DDISH_NM;
    if (typeof rawDish !== 'string') continue;
    const dishes = splitDishes(rawDish);
    if (dishes.length === 0) continue;
    const slot =
      mealSlotFromName(row.MMEAL_SC_NM) ??
      mealSlotFromCode(row.MMEAL_SC_CODE) ??
      (rows.length === 1 ? 'lunch' : null);
    if (!slot) continue;
    const kcal = parseKcal(row.CAL_INFO);
    const prev = out[slot];
    out[slot] = {
      dishes: prev ? [...prev.dishes, ...dishes] : dishes,
      kcal: kcal ?? prev?.kcal,
    };
  }
  return Object.keys(out).length > 0 ? out : null;
}

@Injectable()
export class MealsService {
  // NestJS singleton 범위에서 같은 학교·날짜의 외부 조회와 저장을 공유합니다.
  private readonly inFlightMeals = new Map<string, Promise<string>>();

  constructor(
    @InjectRepository(MealCache)
    private readonly mealCacheRepo: Repository<MealCache>,
    private readonly settingsService: SettingsService,
  ) {}

  async getMealsForWeek(
    offset = 0,
    forceRefresh = false,
  ): Promise<{ date: string; content: string }[]> {
    const monday = startOfWeekMonday(new Date());
    monday.setDate(monday.getDate() + offset * 7);
    const out: { date: string; content: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const date = toDateKey(d);
      const content = await this.getMealForDate(date, forceRefresh);
      out.push({ date, content });
    }
    return out;
  }

  async getMealForDate(
    targetDate: string | Date,
    forceRefresh: boolean,
  ): Promise<string> {
    const dateObj =
      typeof targetDate === 'string' ? new Date(targetDate + 'T12:00:00') : targetDate;
    const mealDate = toDateKey(dateObj);

    const settings = await this.settingsService.loadAll();
    const officeCode =
      (settings.office_code ?? '').trim() ||
      (process.env.NEIS_OFFICE_CODE ?? '').trim();
    const schoolCode =
      (settings.school_code ?? '').trim() ||
      (process.env.NEIS_SCHOOL_CODE ?? '').trim();

    const apiKey = (process.env.NEIS_API_KEY ?? '').trim();
    if (!apiKey) {
      return 'NEIS_API_KEY가 비어 있습니다. 서버 .env에 나이스 인증키를 넣은 뒤 재시작하세요.';
    }

    if (!officeCode || !schoolCode) {
      return '교육청 코드·학교 코드가 없습니다. 관리자 설정 또는 .env의 NEIS_OFFICE_CODE, NEIS_SCHOOL_CODE를 확인하세요.';
    }

    const key = JSON.stringify([officeCode, schoolCode, mealDate]);
    const running = this.inFlightMeals.get(key);
    if (running) return running;

    if (!forceRefresh) {
      const cached = await this.readCachedMeal(mealDate);
      // 캐시 조회 중 강제 갱신이 시작됐다면 오래된 캐시 대신 새 결과를 기다립니다.
      const refreshing = this.inFlightMeals.get(key);
      if (refreshing) return refreshing;
      if (cached !== null) return cached;
    }

    // DB 조회를 기다리는 동안 다른 요청이 조회를 시작했을 수 있습니다.
    const startedWhileReading = this.inFlightMeals.get(key);
    if (startedWhileReading) return startedWhileReading;

    const pending = this.fetchAndCacheMeal(
      mealDate,
      dateObj,
      officeCode,
      schoolCode,
      apiKey,
      forceRefresh,
    );
    this.inFlightMeals.set(key, pending);

    try {
      return await pending;
    } finally {
      // 네트워크/파싱/DB 오류가 발생해도 다음 요청이 재시도할 수 있도록 정리합니다.
      if (this.inFlightMeals.get(key) === pending) {
        this.inFlightMeals.delete(key);
      }
    }
  }

  private async readCachedMeal(mealDate: string): Promise<string | null> {
    const cached = await this.mealCacheRepo.findOneBy({ meal_date: mealDate });
    const content = cached?.content?.trim();
    if (!content?.startsWith('{')) return null;

    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      if (parsed && (parsed.breakfast || parsed.lunch || parsed.dinner)) {
        return cached.content;
      }
    } catch {
      // 실패 안내문, 잘못된 JSON, 빈 급식 데이터는 재사용하지 않습니다.
    }
    return null;
  }

  private async fetchAndCacheMeal(
    mealDate: string,
    dateObj: Date,
    officeCode: string,
    schoolCode: string,
    apiKey: string,
    forceRefresh: boolean,
  ): Promise<string> {
    if (!forceRefresh) {
      // 이전 DB 조회가 늦게 끝난 경우, 먼저 완료된 요청이 저장한 캐시를 재확인합니다.
      const cached = await this.readCachedMeal(mealDate);
      if (cached !== null) return cached;
    }

    const ymd = formatYmd(dateObj);
    const url = new URL('https://open.neis.go.kr/hub/mealServiceDietInfo');
    url.searchParams.set('KEY', apiKey);
    url.searchParams.set('Type', 'json');
    url.searchParams.set('pIndex', '1');
    url.searchParams.set('pSize', '100');
    url.searchParams.set('ATPT_OFCDC_SC_CODE', officeCode);
    url.searchParams.set('SD_SCHUL_CODE', schoolCode);
    url.searchParams.set('MLSV_YMD', ymd);

    let content = '';
    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error('NEIS request failed');
      const text = await res.text();
      let payload: unknown;
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        await this.mealCacheRepo.delete({ meal_date: mealDate }).catch(() => undefined);
        return '급식 정보를 불러오지 못했습니다.';
      }
      const structured = parseNeisStructuredMeals(payload);
      content =
        structured && Object.keys(structured).length > 0
          ? JSON.stringify(structured)
          : '{}';
    } catch {
      content = '급식 정보를 불러오지 못했습니다.';
    }

    if (content.trim().startsWith('{')) {
      await this.cacheMeal(mealDate, content);
    } else {
      await this.mealCacheRepo.delete({ meal_date: mealDate }).catch(() => undefined);
    }
    return content;
  }

  private async cacheMeal(mealDate: string, content: string): Promise<void> {
    // ON CONFLICT (meal_date) DO UPDATE: 다른 프로세스의 동시 저장도 원자적으로 처리합니다.
    await this.mealCacheRepo.upsert(
      { meal_date: mealDate, content, fetched_at: new Date() },
      ['meal_date'],
    );
  }
}
