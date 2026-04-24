/**
 * 공개 데모용 로그인 계정을 DB에 넣습니다. 이미 있으면 건너뜁니다.
 * 사용: 프로젝트 루트에서 `npm run seed:demo` (.env의 DB 설정 사용)
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/entities/user.entity';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? 'ClassPage2026!';

const DEMOS: { username: string; name: string; role: UserRole }[] = [
  { username: 'student_demo', name: '데모 학생', role: 'student' },
  { username: 'teacher_demo', name: '데모 교사', role: 'teacher' },
  { username: 'career_demo', name: '데모 진로', role: 'career' },
];

async function main() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'classpage',
    password: process.env.DB_PASSWORD ?? 'classpage1234',
    database: process.env.DB_DATABASE ?? 'classpage',
    entities: [User],
    synchronize: false,
  });
  await ds.initialize();
  const repo = ds.getRepository(User);
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const d of DEMOS) {
    const existing = await repo.findOneBy({ username: d.username });
    if (existing) {
      console.log(`skip (exists): ${d.username}`);
      continue;
    }
    await repo.save(
      repo.create({
        username: d.username,
        password_hash: hash,
        name: d.name,
        role: d.role,
      }),
    );
    console.log(`created: ${d.username} (${d.role})`);
  }

  console.log('');
  console.log('공통 비밀번호:', DEMO_PASSWORD);
  console.log('(바꾸려면 .env에 DEMO_SEED_PASSWORD=... 후 다시 실행, 이미 있는 아이디는 위에서 skip)');
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
