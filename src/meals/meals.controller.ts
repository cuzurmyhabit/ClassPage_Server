import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MealsService } from './meals.service';

@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

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
