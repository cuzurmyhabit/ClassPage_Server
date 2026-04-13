import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploymentPost } from '../entities/employment-post.entity';
import { EmploymentService } from './employment.service';
import { EmploymentController } from './employment.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([EmploymentPost])],
  controllers: [EmploymentController],
  providers: [EmploymentService, RolesGuard],
  exports: [EmploymentService],
})
export class EmploymentModule {}
