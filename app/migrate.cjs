// Aplica las migraciones SQL de ./drizzle al arrancar el contenedor.
// Usa drizzle-orm (dependencia de producción), sin drizzle-kit.
const mysql = require("mysql2/promise");
const { drizzle } = require("drizzle-orm/mysql2");
const { migrate } = require("drizzle-orm/mysql2/migrator");

(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no definida");
  }
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 2,
    timezone: "Z",
  });
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
