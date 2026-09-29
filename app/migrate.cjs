// Aplica las migraciones SQL de ./drizzle al arrancar el contenedor.
// Usa drizzle-orm (dependencia de producción), sin drizzle-kit.
const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");

(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no definida");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("migraciones aplicadas");
  } finally {
    await pool.end();
  }
})().catch((e) => {
  console.error("migrate failed:", e.message);
  process.exit(1);
});
