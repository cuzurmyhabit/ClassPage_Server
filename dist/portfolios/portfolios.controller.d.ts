import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { User } from '../entities/user.entity';
export declare class PortfoliosController {
    private readonly portfoliosService;
    constructor(portfoliosService: PortfoliosService);
    findAll(user: User): Promise<import("../entities").Portfolio[]>;
    findMine(user: User): Promise<import("../entities").Portfolio[]>;
    create(dto: CreatePortfolioDto, user: User): Promise<import("../entities").Portfolio>;
    delete(id: number, user: User): Promise<void>;
}
