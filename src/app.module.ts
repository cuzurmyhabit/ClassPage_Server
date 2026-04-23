import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Announcement,
  Assignment,
  EmploymentPost,
  Event,
  MealCache,
  Penalty,
  Portfolio,
  Rule,
  Setting,
  User,
} from './entities';
import { AuthModule } from './auth/auth.module';
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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME ?? 'classpage',
      password: process.env.DB_PASSWORD ?? 'classpage1234',
      database: process.env.DB_DATABASE ?? 'classpage',
      entities: [
        User,
        Event,
        EmploymentPost,
        Portfolio,
        Rule,
        Penalty,
        Announcement,
        Assignment,
        Setting,
        MealCache,
      ],
      synchronize: (process.env.DB_SYNC ?? 'false') === 'true',
    }),
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
