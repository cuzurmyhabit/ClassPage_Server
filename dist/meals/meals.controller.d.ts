import { MealsService } from './meals.service';
export declare class MealsController {
    private readonly mealsService;
    constructor(mealsService: MealsService);
    getTodayMeal(refresh?: string): Promise<{
        date: string;
        content: string;
    }>;
    getMealsForWeek(offset?: string, refresh?: string): Promise<{
        date: string;
        content: string;
    }[]>;
}
