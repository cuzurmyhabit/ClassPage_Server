import { Repository } from 'typeorm';
import { Rule } from '../entities/rule.entity';
export declare class RulesService {
    private readonly rulesRepo;
    constructor(rulesRepo: Repository<Rule>);
    findAll(): Promise<Rule[]>;
    create(content: string): Promise<Rule>;
    delete(id: number): Promise<void>;
}
