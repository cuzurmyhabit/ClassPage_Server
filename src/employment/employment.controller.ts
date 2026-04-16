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

  @Get('permission')
  async canManage(@CurrentUser() user: User) {
    try {
      await this.employmentService.assertCanManageEmployment(user.id, user.role);
      return { canManage: true };
    } catch {
      return { canManage: false };
    }
  }

  @Post()
  async create(
    @Body() dto: CreateEmploymentDto,
    @CurrentUser() user: User,
  ) {
    await this.employmentService.assertCanManageEmployment(user.id, user.role);
    return this.employmentService.create(dto, user.id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    await this.employmentService.assertCanManageEmployment(user.id, user.role);
    return this.employmentService.delete(id);
  }
}
