import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private usersRepo;
    constructor(usersRepo: Repository<User>);
    validate(payload: {
        sub: number;
        username: string;
    }): Promise<User>;
}
export {};
