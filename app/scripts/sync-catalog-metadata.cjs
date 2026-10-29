require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const mysql = require("mysql2/promise");

const ROOT = path.resolve(__dirname, "..", "..");
const PUBLIC_DIR = path.join(ROOT, "appweb", "public");
const CATALOG_FILES = [
  path.join(ROOT, "appweb", "services", "catalog.mock.ts"),
  path.join(ROOT, "appweb", "services", "catalog.products.ts"),
];

const CATEGORY_NAMES = {
  belleza: "Belleza",
  electricos: "Eléctricos",
  perfumeria: "Perfumería",
  tecnologia: "Tecnología",
};

const FEATURED_SLUGS = [
  "aro-luz-i8",
  "audifonos-personales",
  "malumeta-v2",
  "maumeta-3d",
  "brocha-arancela-maquillaje",
  "depilador-dama",
];

const BEST_SELLER_SLUGS = [
  "aro-luz-i8",
  "proyector-android",
  "audifonos-personales",
  "malumeta",
  "xiam-pro",
  "brocha-arancela-maquillaje",
  "depilador-dama",
  "maquina-hair-clipper",
];

function readCatalogImages() {
  const images = new Map();
  for (const file of CATALOG_FILES) {
    const text = fs.readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line.includes("price:")) continue;
      const slug = line.match(/slug:\s*"([^"]+)"/);
      const image = line.match(/image:\s*"([^"]+)"/);
      if (slug && image) images.set(slug[1], image[1]);
    }
  }
  return images;
}

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const user = process.env.MYSQL_USER || "importify";
  const password = process.env.MYSQL_PASSWORD || "importify";
  const database = process.env.MYSQL_DATABASE || "importify";
  const port = process.env.MYSQL_PORT || "3306";
  return `mysql://${user}:${password}@127.0.0.1:${port}/${database}`;
}

function localImagePath(image) {
  if (!image || !image.startsWith("/images/")) return null;
  return path.join(PUBLIC_DIR, "images", image.replace(/^\/images\//, ""));
}

function imageExists(image) {
  const file = localImagePath(image);
  return Boolean(file && fs.existsSync(file));
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const verifyOnly = process.argv.includes("--verify");
  const catalogImages = readCatalogImages();
  if (catalogImages.size === 0) {
    throw new Error("No se pudieron leer imágenes del catálogo local");
  }

  const connection = await mysql.createConnection({
    uri: resolveDatabaseUrl(),
    charset: "utf8mb4",
  });

  const changes = { imagesUpdated: 0, imagesInserted: 0, categoriesUpdated: 0, flagsUpdated: 0 };
  const problems = [];

  try {
    const [products] = await connection.query(
      "SELECT id, slug, name, is_featured, is_best_seller FROM products ORDER BY slug",
    );
    const [categories] = await connection.query("SELECT id, slug, name FROM categories");
    const [imageRows] = await connection.query(
      "SELECT id, product_id, image, processed_image, is_primary FROM product_images",
    );

    const primaryByProduct = new Map();
    for (const row of imageRows) {
      if (Number(row.is_primary) === 1) primaryByProduct.set(row.product_id, row);
    }

    if (!verifyOnly) await connection.beginTransaction();

    for (const product of products) {
      const image = catalogImages.get(product.slug);
      if (!image) {
        problems.push(`Sin imagen local para ${product.slug}`);
        continue;
      }
      if (!imageExists(image)) {
        problems.push(`No existe archivo local para ${product.slug}: ${image}`);
        continue;
      }

      const primary = primaryByProduct.get(product.id);
      if (primary) {
        if (primary.processed_image !== image) {
          changes.imagesUpdated += 1;
          if (!dryRun && !verifyOnly) {
            await connection.query(
              "UPDATE product_images SET processed_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
              [image, primary.id],
            );
          }
        }
      } else {
        changes.imagesInserted += 1;
        if (!dryRun && !verifyOnly) {
          await connection.query(
            `INSERT INTO product_images
              (id, product_id, image, processed_image, alt_text, is_primary, processing_status)
             VALUES (?, ?, ?, ?, ?, 1, 'completed')`,
            [randomUUID(), product.id, image, image, product.name],
          );
        }
      }

      const shouldFeature = FEATURED_SLUGS.includes(product.slug);
      const shouldBestSeller = BEST_SELLER_SLUGS.includes(product.slug);
      if (Boolean(product.is_featured) !== shouldFeature || Boolean(product.is_best_seller) !== shouldBestSeller) {
        changes.flagsUpdated += 1;
        if (!dryRun && !verifyOnly) {
          await connection.query(
            "UPDATE products SET is_featured = ?, is_best_seller = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [shouldFeature ? 1 : 0, shouldBestSeller ? 1 : 0, product.id],
          );
        }
      }
    }

    for (const category of categories) {
      const expected = CATEGORY_NAMES[category.slug];
      if (expected && category.name !== expected) {
        changes.categoriesUpdated += 1;
        if (!dryRun && !verifyOnly) {
          await connection.query(
            "UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [expected, category.id],
          );
        }
      }
    }

    if (!verifyOnly) {
      if (dryRun) await connection.rollback();
      else await connection.commit();
    }

    console.log(
      `${dryRun ? "[dry-run] " : verifyOnly ? "[verify] " : ""}` +
        `productos=${products.length} imágenes_actualizadas=${changes.imagesUpdated} ` +
        `imágenes_insertadas=${changes.imagesInserted} categorías=${changes.categoriesUpdated} ` +
        `flags=${changes.flagsUpdated}`,
    );

    if (problems.length) {
      console.error("Problemas detectados:");
      for (const problem of problems) console.error(`- ${problem}`);
      process.exitCode = 1;
    }

    if (verifyOnly) {
      const [missing] = await connection.query(
        `SELECT p.slug
           FROM products p
           LEFT JOIN product_images pi
             ON pi.product_id = p.id AND pi.is_primary = 1
          WHERE pi.id IS NULL
          ORDER BY p.slug`,
      );
      if (missing.length) {
        console.error(`Productos sin imagen principal: ${missing.map((r) => r.slug).join(", ")}`);
        process.exitCode = 1;
      } else {
        console.log("Verificación OK: todos los productos tienen imagen principal.");
      }
    }
  } catch (error) {
    if (!verifyOnly && !dryRun) {
      try {
        await connection.rollback();
      } catch {
        // noop
      }
    }
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
