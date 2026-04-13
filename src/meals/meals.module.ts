import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealCache } from '../entities/meal-cache.entity';
import { SettingsModule } from '../settings/settings.module';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';

@Module({
  imports: [TypeOrmModule.forFeature([MealCache]), SettingsModule],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule {}
