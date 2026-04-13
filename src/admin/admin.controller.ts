import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getAdminData() {
    return this.adminService.getAdminData();
  }

  @Put('settings')
  updateSettings(@Body() body: UpdateSettingsDto) {
    return this.adminService.updateSettings(body);
  }

  @Post('users')
  createUser(@Body() body: CreateUserDto) {
    return this.adminService.createUser(body);
  }

  @Get('schools')
  searchSchools(
    @Query('office_code') officeCode: string,
    @Query('query') query: string,
  ) {
    return this.adminService.searchSchools(officeCode ?? '', query ?? '');
  }
}
