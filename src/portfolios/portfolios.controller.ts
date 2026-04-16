import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    if (user.role === 'admin' || user.role === 'teacher') {
      return this.portfoliosService.findAll();
    }
    return this.portfoliosService.findByStudent(user.id);
  }

  @Get('me')
  findMine(@CurrentUser() user: User) {
    return this.portfoliosService.findByStudent(user.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('student')
  create(
    @Body() dto: CreatePortfolioDto,
    @CurrentUser() user: User,
  ) {
    return this.portfoliosService.create(dto, user.id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.portfoliosService.delete(id, user.id, user.role);
  }
}
