"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTypeOrmOptions = buildTypeOrmOptions;
const environment_1 = require("./config/environment");
const entities_1 = require("./entities");
const entities = [
    entities_1.User,
    entities_1.Event,
    entities_1.EmploymentPost,
    entities_1.Portfolio,
    entities_1.Rule,
    entities_1.Penalty,
    entities_1.Announcement,
    entities_1.Assignment,
    entities_1.Setting,
    entities_1.MealCache,
];
function postgresSsl() {
    if (process.env.DB_SSL === 'false')
        return undefined;
    if (process.env.DB_SSL === 'true')
        return { rejectUnauthorized: false };
    const url = process.env.DATABASE_URL ?? '';
    if (url.includes('neon.tech') ||
        url.includes('supabase.co') ||
        url.includes('render.com')) {
        return { rejectUnauthorized: false };
    }
    return undefined;
}
function buildTypeOrmOptions() {
    const synchronize = (process.env.DB_SYNC ?? 'false') === 'true';
    const url = process.env.DATABASE_URL?.trim();
    const ssl = postgresSsl();
    const sslOpt = ssl ? { ssl } : {};
    if (url) {
        return {
            type: 'postgres',
            url,
            ...sslOpt,
            entities,
            synchronize,
        };
    }
    return {
        type: 'postgres',
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'classpage',
        password: (0, environment_1.requireEnvironment)('DB_PASSWORD'),
        database: process.env.DB_DATABASE ?? 'classpage',
        ...sslOpt,
        entities,
        synchronize,
    };
}
//# sourceMappingURL=typeorm.config.js.map