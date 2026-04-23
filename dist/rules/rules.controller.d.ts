import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
export declare class RulesController {
    private readonly rulesService;
    constructor(rulesService: RulesService);
    findAll(): Promise<import("../entities").Rule[]>;
    create(dto: CreateRuleDto): Promise<import("../entities").Rule>;
    delete(id: number): Promise<void>;
}
