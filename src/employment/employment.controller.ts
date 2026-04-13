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
import { EmploymentService } from './employment.service';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('employment')
@UseGuards(JwtAuthGuard)
export class EmploymentController {
  constructor(private readonly employmentService: EmploymentService) {}

  @Get()
  findAll() {
    return this.employmentService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'career')
  create(
    @Body() dto: CreateEmploymentDto,
    @CurrentUser() user: User,
  ) {
    return this.employmentService.create(dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'career')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.employmentService.delete(id);
  }
}
