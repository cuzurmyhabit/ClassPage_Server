import 'reflect-metadata';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { buildTypeOrmOptions } from './typeorm.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPrefix = process.env.API_PREFIX?.trim();
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  const corsOrigin = process.env.CORS_ORIGIN?.trim();

  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((origin) => origin.trim())
      : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/health', (_req, res) => {
    res.status(200).type('text/plain').send('ok');
  });

  const port = Number(process.env.PORT ?? 3000);
  const dbOpts = buildTypeOrmOptions() as {
    url?: string;
    host?: string;
    port?: number;
    database?: string;
  };
  if (dbOpts.url) {
    console.log('[DB] postgres (DATABASE_URL)');
  } else {
    console.log(
      `[DB] postgres ${dbOpts.host}:${dbOpts.port}/${dbOpts.database}`,
    );
  }

  await app.listen(port);
  console.log(`ClassPage server is running on port ${port}`);
}

bootstrap();
