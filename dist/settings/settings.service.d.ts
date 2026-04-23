import { Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity';
export declare class SettingsService {
    private readonly settingsRepo;
    constructor(settingsRepo: Repository<Setting>);
    loadAll(): Promise<Record<string, string>>;
    get(key: string): Promise<string>;
    save(key: string, value: string): Promise<void>;
    saveMany(entries: Record<string, string>): Promise<void>;
}
