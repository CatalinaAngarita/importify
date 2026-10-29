require("dotenv/config");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const EXPECTED_MIN = {
  roles: 1,
  users: 1,
  categories: 1,
  products: 1,
  product_images: 1,
};

function findPublicImagesDir() {
  const candidates = [
    path.resolve(__dirname, "..", "..", "appweb", "public", "images"),
    path.resolve(process.cwd(), "..", "appweb", "public", "images"),
    path.resolve(process.cwd(), "appweb", "public", "images"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL no definida");

  const connection = await mysql.createConnection({
    uri: databaseUrl,
    charset: "utf8mb4",
  });

  try {
    for (const [table, minimum] of Object.entries(EXPECTED_MIN)) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) AS total FROM \`${table}\``,
      );
      const total = Number(rows[0].total);
      if (total < minimum) {
        throw new Error(`La tabla ${table} tiene ${total} filas (minimo ${minimum})`);
      }
      console.log(`${table}: ${total}`);
    }

    const imagesDir = findPublicImagesDir();
    if (!imagesDir) throw new Error("No se encontro appweb/public/images");

    const [images] = await connection.query(
      "SELECT image, processed_image FROM product_images",
    );

    const missing = [];
    for (const row of images) {
      for (const value of [row.image, row.processed_image]) {
        if (!value || !value.startsWith("/images/")) continue;
        const filePath = path.join(imagesDir, value.replace(/^\/images\//, ""));
        if (!fs.existsSync(filePath)) missing.push(value);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Faltan ${missing.length} imagenes en appweb/public/images:\n${missing.join("\n")}`,
      );
    }

    console.log(`imagenes verificadas: ${images.length} registros, 0 faltantes`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
