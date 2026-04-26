import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/entities/user.entity';
import { Setting } from '../src/entities/setting.entity';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const COMMON_PASSWORD = process.env.CLASS_USERS_SEED_PASSWORD ?? '1234';

const CLASS_USERS: { username: string; name: string; role: UserRole }[] = [
  { name: '임진하', username: '3200', role: 'teacher' },
  { name: '곽자경', username: '3201', role: 'student' },
  { name: '김효일', username: '3202', role: 'student' },
  { name: '박진우', username: '3203', role: 'student' },
  { name: '박태윤', username: '3204', role: 'student' },
  { name: '송민채', username: '3205', role: 'student' },
  { name: '우지영', username: '3206', role: 'student' },
  { name: '육준성', username: '3207', role: 'student' },
  { name: '윤성연', username: '3208', role: 'student' },
  { name: '윤시웅', username: '3209', role: 'student' },
  { name: '이상희', username: '3210', role: 'student' },
  { name: '임소영', username: '3211', role: 'student' },
  { name: '임지유', username: '3212', role: 'student' },
  { name: '임하정', username: '3213', role: 'student' },
  { name: '장세은', username: '3214', role: 'student' },
  { name: '정다운', username: '3215', role: 'student' },
  { name: '지수민', username: '3216', role: 'career' },
];

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  const ds = new DataSource(
    url
      ? {
          type: 'postgres',
          url,
          ssl:
            process.env.DB_SSL === 'true'
              ? { rejectUnauthorized: false }
              : false,
          entities: [User, Setting],
          synchronize: false,
        }
      : {
          type: 'postgres',
          host: process.env.DB_HOST ?? '127.0.0.1',
          port: Number(process.env.DB_PORT ?? 5432),
          username: process.env.DB_USERNAME ?? 'classpage',
          password: process.env.DB_PASSWORD ?? 'classpage1234',
          database: process.env.DB_DATABASE ?? 'classpage',
          entities: [User, Setting],
          synchronize: false,
        },
  );

  await ds.initialize();
  const userRepo = ds.getRepository(User);
  const settingRepo = ds.getRepository(Setting);
  const hash = await bcrypt.hash(COMMON_PASSWORD, 10);

  for (const candidate of CLASS_USERS) {
    const existing = await userRepo.findOneBy({ username: candidate.username });
    if (existing) {
      existing.name = candidate.name;
      existing.role = candidate.role;
      existing.password_hash = hash;
      existing.must_change_password = true;
      await userRepo.save(existing);
      console.log(`updated: ${candidate.username} (${candidate.role})`);
      continue;
    }

    await userRepo.save(
      userRepo.create({
        username: candidate.username,
        name: candidate.name,
        role: candidate.role,
        password_hash: hash,
        must_change_password: true,
      }),
    );
    console.log(`created: ${candidate.username} (${candidate.role})`);
  }

  const careerUser = await userRepo.findOneBy({ username: '3216' });
  if (careerUser) {
    const setting = await settingRepo.findOneBy({
      key: 'employment_manager_user_id',
    });
    if (setting) {
      setting.value = String(careerUser.id);
      await settingRepo.save(setting);
    } else {
      await settingRepo.save(
        settingRepo.create({
          key: 'employment_manager_user_id',
          value: String(careerUser.id),
        }),
      );
    }
    console.log(`employment_manager_user_id -> ${careerUser.id} (3216)`);
  }

  console.log('');
  console.log('공통 비밀번호:', COMMON_PASSWORD);
  console.log(
    '변경하려면 CLASS_USERS_SEED_PASSWORD 값을 지정해서 다시 실행하세요.',
  );
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
