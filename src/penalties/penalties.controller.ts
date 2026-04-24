import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PenaltiesService } from './penalties.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { UpdatePenaltyDto } from './dto/update-penalty.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('penalties')
@UseGuards(JwtAuthGuard)
export class PenaltiesController {
  constructor(private readonly penaltiesService: PenaltiesService) {}

  @Get('recent')
  async findRecent() {
    const penalties = await this.penaltiesService.findRecent(500);
    return penalties;
  }

  @Get()
  async findByWeek(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const weekStart = this.penaltiesService.weekStartForOffset(offset);
    const penalties = await this.penaltiesService.findByWeek(weekStart);
    return {
      penalties,
      weekStart,
      prevOffset: offset - 1,
      nextOffset: offset + 1,
    };
  }

  @Get('this-week')
  async findThisWeek() {
    const weekStart = this.penaltiesService.weekStartForOffset(0);
    const penalties = await this.penaltiesService.findByWeek(weekStart);
    return { penalties, weekStart };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  create(@Body() dto: CreatePenaltyDto, @CurrentUser() user: User) {
    return this.penaltiesService.create(dto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePenaltyDto) {
    return this.penaltiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.penaltiesService.delete(id);
  }
}
