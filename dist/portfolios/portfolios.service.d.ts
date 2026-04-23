import { Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';
import { UserRole } from '../entities/user.entity';
export declare class PortfoliosService {
    private readonly portfolioRepo;
    constructor(portfolioRepo: Repository<Portfolio>);
    findAll(): Promise<Portfolio[]>;
    findByStudent(studentId: number): Promise<Portfolio[]>;
    count(): Promise<number>;
    countByStudent(studentId: number): Promise<number>;
    create(data: {
        title: string;
        summary?: string;
        content: string;
        link?: string;
    }, studentId: number): Promise<Portfolio>;
    delete(id: number, userId: number, userRole: UserRole): Promise<void>;
}
