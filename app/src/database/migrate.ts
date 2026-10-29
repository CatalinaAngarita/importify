import { existsSync } from 'fs';
import { join } from 'path';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { getDb } from './db';

function resolveMigrationsFolder() {
  const candidates = [
    join(__dirname, '..', 'drizzle'),
    join(__dirname, '..', '..', 'drizzle'),
    join(process.cwd(), 'drizzle'),
    join(process.cwd(), 'dist', 'drizzle'),
  ];

  const folder = candidates.find((candidate) =>
    existsSync(join(candidate, 'meta', '_journal.json')),
  );

  if (!folder) {
    throw new Error(
      `No se encontro la carpeta de migraciones. Buscado en: ${candidates.join(', ')}`,
    );
  }

  return folder;
}

export async function runMigrations() {
  const migrationsFolder = resolveMigrationsFolder();
  await migrate(getDb(), { migrationsFolder });
  // eslint-disable-next-line no-console
  console.log(`migraciones aplicadas desde ${migrationsFolder}`);
}
