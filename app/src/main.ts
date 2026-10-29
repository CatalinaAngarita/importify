import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getUploadsDir } from './common/uploads';
import { NestExpressApplication } from '@nestjs/platform-express';
import { runMigrations } from './database/migrate';

async function bootstrap() {
  const migrationsOnStart =
    process.env.RUN_MIGRATIONS_ON_START ??
    (process.env.NODE_ENV === 'production' ? 'true' : 'false');
  if (migrationsOnStart === 'true') {
    await runMigrations();
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
    credentials: true,
  });
  app.useStaticAssets(getUploadsDir(), { prefix: '/uploads' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? process.env.APP_PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`app listening on http://localhost:${port}/api`);
}

void bootstrap();
