export type UserRole = 'admin' | 'teacher' | 'career' | 'student';
export declare class User {
    id: number;
    username: string;
    password_hash: string;
    name: string;
    role: UserRole;
    created_at: Date;
}
