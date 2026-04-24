import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  Announcement,
  Assignment,
  EmploymentPost,
  Event,
  MealCache,
  Penalty,
  Portfolio,
  Rule,
  Setting,
  User,
} from './entities';

const entities = [
  User,
  Event,
  EmploymentPost,
  Portfolio,
  Rule,
  Penalty,
  Announcement,
  Assignment,
  Setting,
  MealCache,
];

/** 로컬 Docker 등에서는 ssl 키를 아예 빼는 편이 안정적입니다. */
function postgresSsl():
  | { rejectUnauthorized: boolean }
  | undefined {
  if (process.env.DB_SSL === 'false') return undefined;
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
  const url = process.env.DATABASE_URL ?? '';
  if (
    url.includes('neon.tech') ||
    url.includes('supabase.co') ||
    url.includes('render.com')
  ) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

export function buildTypeOrmOptions(): TypeOrmModuleOptions {
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
    password: process.env.DB_PASSWORD ?? 'classpage1234',
    database: process.env.DB_DATABASE ?? 'classpage',
    ...sslOpt,
    entities,
    synchronize,
  };
}
