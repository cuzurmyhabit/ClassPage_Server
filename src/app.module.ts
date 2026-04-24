import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { buildTypeOrmOptions } from './typeorm.config';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { EmploymentModule } from './employment/employment.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { RulesModule } from './rules/rules.module';
import { PenaltiesModule } from './penalties/penalties.module';
import { MealsModule } from './meals/meals.module';
import { EventsModule } from './events/events.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(buildTypeOrmOptions()),
    AuthModule,
    UsersModule,
    SettingsModule,
    EmploymentModule,
    PortfoliosModule,
    RulesModule,
    PenaltiesModule,
    MealsModule,
    EventsModule,
    AssignmentsModule,
    AnnouncementsModule,
    AdminModule,
  ],
})
export class AppModule {}
