require("dotenv/config");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL no definida");

  const sqlFile =
    process.argv[2] ||
    path.resolve(__dirname, "..", "..", "database", "importify-data.sql");

  if (!fs.existsSync(sqlFile)) {
    throw new Error(`No existe el archivo SQL: ${sqlFile}`);
  }

  const sql = fs.readFileSync(sqlFile, "utf8");
  const connection = await mysql.createConnection({
    uri: databaseUrl,
    multipleStatements: true,
    charset: "utf8mb4",
  });

  try {
    console.log(`Importando ${sqlFile}`);
    await connection.query("SET FOREIGN_KEY_CHECKS=0");
    await connection.query(sql);
    await connection.query("SET FOREIGN_KEY_CHECKS=1");
    console.log("Datos importados correctamente");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
