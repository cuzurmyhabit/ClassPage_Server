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
    for (let i = 0; i < 5; i++) {
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
    const officeCode = (settings.office_code ?? '').trim();
    const schoolCode = (settings.school_code ?? '').trim();
    const missingCodesMessage =
      '관리자 페이지에서 교육청 코드와 학교 코드를 입력하면 급식을 자동으로 불러옵니다.';

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
      let payload: unknown;
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        content = '급식 정보를 불러오지 못했습니다.';
        await this.cacheMeal(mealDate, content);
        return content;
      }
      const structured = parseNeisStructuredMeals(payload);
      content = structured
        ? JSON.stringify(structured)
        : '해당 날짜의 급식 정보가 없습니다.';
    } catch {
      content = '급식 정보를 불러오지 못했습니다.';
    }

    await this.cacheMeal(mealDate, content);
    return content;
  }

  private async cacheMeal(mealDate: string, content: string): Promise<void> {
    const existing = await this.mealCacheRepo.findOneBy({ meal_date: mealDate });
    const fetched_at = new Date();
    if (existing) {
      existing.content = content;
      existing.fetched_at = fetched_at;
      await this.mealCacheRepo.save(existing);
    } else {
      await this.mealCacheRepo.save(
        this.mealCacheRepo.create({ meal_date: mealDate, content, fetched_at }),
      );
    }
  }
}
