import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { ImportEventsDto } from './dto/import-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

function parseYearMonth(monthParam: string): { year: number; month: number } {
  if (!/^\d{4}-\d{2}$/.test(monthParam)) {
    throw new BadRequestException(
      'month 쿼리는 YYYY-MM 형식이어야 합니다.',
    );
  }
  const [y, m] = monthParam.split('-').map((s) => parseInt(s, 10));
  if (m < 1 || m > 12) {
    throw new BadRequestException('유효하지 않은 월입니다.');
  }
  return { year: y, month: m };
}

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findByMonth(@Query('month') month: string) {
    if (!month) {
      throw new BadRequestException('month 쿼리(YYYY-MM)가 필요합니다.');
    }
    const { year, month: m } = parseYearMonth(month);
    return this.eventsService.findByMonth(year, m);
  }

  @Get('upcoming')
  findUpcoming(@Query('limit') limit?: string) {
    const n = limit !== undefined ? parseInt(limit, 10) : 5;
    const lim = Number.isFinite(n) && n > 0 ? n : 5;
    return this.eventsService.findUpcomingWithCountdown(lim);
  }

  @Get('headline')
  async findHeadline() {
    const rows = await this.eventsService.findUpcomingWithCountdown(1);
    return rows[0] ?? null;
  }

  @Post()
  @Roles('admin', 'teacher')
  create(@Body() dto: CreateEventDto, @CurrentUser() user: User) {
    return this.eventsService.create(
      {
        title: dto.title,
        description: dto.description ?? '',
        event_date: dto.event_date,
      },
      user.id,
    );
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'teacher')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.eventsService.delete(id);
    return { ok: true };
  }

  @Post('import')
  @Roles('admin', 'teacher')
  importEvents(@Body() body: ImportEventsDto, @CurrentUser() user: User) {
    return this.eventsService.importEvents(
      body.events.map((e) => ({
        title: e.title,
        description: e.description ?? '',
        event_date: e.event_date,
      })),
      user.id,
      body.replaceExisting,
    );
  }
}
