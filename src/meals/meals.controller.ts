import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MealsService } from './meals.service';

@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get('today')
  async getTodayMeal(@Query('refresh') refresh?: string) {
    const force =
      refresh === '1' ||
      refresh === 'true' ||
      refresh === 'yes';
    const today = new Date();
    const content = await this.mealsService.getMealForDate(today, force);
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return { date: `${y}-${m}-${d}`, content };
  }

  @Get()
  getMealsForWeek(
    @Query('offset') offset?: string,
    @Query('refresh') refresh?: string,
  ) {
    const o = offset !== undefined && offset !== '' ? Number(offset) : 0;
    const force =
      refresh === '1' ||
      refresh === 'true' ||
      refresh === 'yes';
    return this.mealsService.getMealsForWeek(
      Number.isFinite(o) ? o : 0,
      force,
    );
  }
}
