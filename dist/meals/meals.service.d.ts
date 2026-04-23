import { Repository } from 'typeorm';
import { MealCache } from '../entities/meal-cache.entity';
import { SettingsService } from '../settings/settings.service';
export declare class MealsService {
    private readonly mealCacheRepo;
    private readonly settingsService;
    constructor(mealCacheRepo: Repository<MealCache>, settingsService: SettingsService);
    getMealsForWeek(offset?: number, forceRefresh?: boolean): Promise<{
        date: string;
        content: string;
    }[]>;
    getMealForDate(targetDate: string | Date, forceRefresh: boolean): Promise<string>;
    private cacheMeal;
}
