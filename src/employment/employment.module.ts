import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploymentPost } from '../entities/employment-post.entity';
import { EmploymentService } from './employment.service';
import { EmploymentController } from './employment.controller';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmploymentPost]), SettingsModule],
  controllers: [EmploymentController],
  providers: [EmploymentService],
  exports: [EmploymentService],
})
export class EmploymentModule {}
