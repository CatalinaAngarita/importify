import "dotenv/config";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { products, categories, productImages } from "../src/database/schema";
import { eq, and } from "drizzle-orm";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 2,
  timezone: "Z",
});

const db = drizzle(pool);

const PRODUCTS_DIR = "./appweb/public/images/products";

const MOCK_PRODUCTS = [
  // Belleza
  { slug: "brocha-arancela-maquillaje", name: "Brocha y arancela de maquillaje", category: "belleza", price: 45900, oldPrice: 59900, stock: 50 },
  { slug: "cubre-pezon", name: "Cubre pezón", category: "belleza", price: 18900, oldPrice: 25900, stock: 100 },
  { slug: "depilador-dama", name: "Depilador de dama", category: "belleza", price: 89900, oldPrice: 119900, stock: 30 },
  { slug: "maquina-hair-clipper", name: "Máquina Hair Clipper", category: "belleza", price: 129900, oldPrice: 169900, stock: 20 },
  { slug: "maquina-metalica", name: "Máquina metálica", category: "belleza", price: 109900, oldPrice: 139900, stock: 25 },
  { slug: "maquina-umate", name: "Máquina Umate", category: "belleza", price: 149900, oldPrice: 189900, stock: 15 },
  { slug: "masajeador-facial", name: "Masajeador facial", category: "belleza", price: 69900, oldPrice: 89900, stock: 40 },
  { slug: "pulidora-drill", name: "Pulidora drill", category: "belleza", price: 59900, oldPrice: 79900, stock: 35 },
  { slug: "quita-callo-portatil", name: "Quita callo portátil", category: "belleza", price: 35900, oldPrice: 45900, stock: 60 },
  { slug: "removedor-electrico-facial", name: "Removedor eléctrico facial", category: "belleza", price: 79900, oldPrice: 99900, stock: 25 },
  // Perfumería
  { slug: "odyssey-litchi-lush", name: "Odyssey Litchi Lush", category: "perfumeria", price: 87500, oldPrice: null, stock: 20 },
  { slug: "odyssey-mega", name: "Odyssey Mega", category: "perfumeria", price: 90000, oldPrice: null, stock: 20 },
  { slug: "odyssey-homne", name: "Odyssey Homne", category: "perfumeria", price: 75000, oldPrice: null, stock: 25 },
  { slug: "odyssey-tyrant", name: "Odyssey Tyrant", category: "perfumeria", price: 75000, oldPrice: null, stock: 25 },
  { slug: "odyssey-spectra", name: "Odyssey Spectra", category: "perfumeria", price: 75000, oldPrice: null, stock: 20 },
  { slug: "odyssey-go-mango", name: "Odyssey Go Mango", category: "perfumeria", price: 87500, oldPrice: null, stock: 20 },
  { slug: "odyssey-mandarin-sky", name: "Odyssey Mandarin Sky", category: "perfumeria", price: 87500, oldPrice: null, stock: 20 },
  { slug: "odyssey-limoni", name: "Odyssey Limoni", category: "perfumeria", price: 80000, oldPrice: null, stock: 20 },
  { slug: "corvus", name: "Corvus", category: "perfumeria", price: 45000, oldPrice: null, stock: 30 },
  { slug: "pegasus", name: "Pegasus", category: "perfumeria", price: 50000, oldPrice: null, stock: 30 },
  { slug: "vega", name: "Vega", category: "perfumeria", price: 45000, oldPrice: null, stock: 30 },
  { slug: "aqua-dubai", name: "Aqua Dubai", category: "perfumeria", price: 85000, oldPrice: null, stock: 20 },
  { slug: "amber-oud", name: "Amber Oud", category: "perfumeria", price: 50000, oldPrice: null, stock: 30 },
  { slug: "ultra-violet", name: "Ultra Violet", category: "perfumeria", price: 90000, oldPrice: null, stock: 15 },
  { slug: "amber-oud-private", name: "Amber Oud Private", category: "perfumeria", price: 60000, oldPrice: null, stock: 20 },
  { slug: "bharara-blue", name: "Bharara Blue", category: "perfumeria", price: 75000, oldPrice: null, stock: 25 },
  { slug: "bharara-king", name: "Bharara King", category: "perfumeria", price: 90000, oldPrice: null, stock: 15 },
  { slug: "niche-femme", name: "Niche Femme", category: "perfumeria", price: 90000, oldPrice: null, stock: 15 },
  { slug: "sckarlet", name: "Sckarlet", category: "perfumeria", price: 90000, oldPrice: null, stock: 15 },
  { slug: "viking-dubai", name: "Viking Dubai", category: "perfumeria", price: 60000, oldPrice: null, stock: 20 },
  // Tecnología
  { slug: "timbre-voz-inteligente", name: "Timbre Voz Inteligente", category: "tecnologia", price: 89900, oldPrice: null, stock: 20 },
  { slug: "proyector-android", name: "Proyector Android", category: "tecnologia", price: 299900, oldPrice: null, stock: 10 },
  { slug: "mini-parlante", name: "Mini Parlante", category: "tecnologia", price: 45900, oldPrice: null, stock: 50 },
  { slug: "combo-k28", name: "Combo K28", category: "tecnologia", price: 129900, oldPrice: null, stock: 20 },
  { slug: "bolso-led", name: "Bolso LED", category: "tecnologia", price: 69900, oldPrice: null, stock: 30 },
  { slug: "audifonos-personales", name: "Audífonos Personales", category: "tecnologia", price: 79900, oldPrice: null, stock: 40 },
  { slug: "audifonos-pantalla", name: "Audífonos con Pantalla", category: "tecnologia", price: 119900, oldPrice: null, stock: 20 },
  { slug: "audifonos-caja-azul", name: "Audífonos Caja Azul", category: "tecnologia", price: 65900, oldPrice: null, stock: 30 },
  { slug: "aro-luz-i8", name: "Aro de Luz I8", category: "tecnologia", price: 59900, oldPrice: null, stock: 30 },
  { slug: "aro-de-luz", name: "Aro de Luz", category: "tecnologia", price: 49900, oldPrice: null, stock: 40 },
  // Eléctricos
  { slug: "brothereta", name: "Brothereta", category: "electricos", price: 89900, oldPrice: null, stock: 20 },
  { slug: "jorz", name: "Jorz", category: "electricos", price: 129900, oldPrice: null, stock: 15 },
  { slug: "malumeta-v2", name: "Malumeta v2", category: "electricos", price: 159900, oldPrice: null, stock: 10 },
  { slug: "malumeta", name: "Malumeta", category: "electricos", price: 149900, oldPrice: null, stock: 15 },
  { slug: "maumeta-3d", name: "Maumeta 3D", category: "electricos", price: 179900, oldPrice: null, stock: 5 },
  { slug: "new-electrico", name: "New Eléctrico", category: "electricos", price: 99900, oldPrice: null, stock: 20 },
  { slug: "three-wheeler", name: "Three Wheeler", category: "electricos", price: 119900, oldPrice: null, stock: 15 },
  { slug: "xiam-pro", name: "Xiam Pro", category: "electricos", price: 139900, oldPrice: null, stock: 10 },
  { slug: "xiam", name: "Xiam", category: "electricos", price: 119900, oldPrice: null, stock: 15 },
  { slug: "yiwu", name: "Yiwu", category: "electricos", price: 79900, oldPrice: null, stock: 25 },
];

const CATEGORY_MAP = {
  belleza: "belleza",
  perfumeria: "perfumeria",
  tecnologia: "tecnologia",
  electricos: "electricos",
};

async function findNobgImage(slug: string): Promise<string | null> {
  const fs = await import("fs/promises");
  const path = await import("path");
  
  const entries = await fs.readdir(PRODUCTS_DIR, { recursive: true, withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith("-nobg.png")) {
      const fileSlug = entry.name.replace("-nobg.png", "").toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[áàä]/g, "a")
        .replace(/[éèë]/g, "e")
        .replace(/[íìï]/g, "i")
        .replace(/[óòö]/g, "o")
        .replace(/[úùü]/g, "u")
        .replace(/[ñ]/g, "n");
      
      if (fileSlug === slug.toLowerCase()) {
        const fullPath = path.join(entry.path, entry.name);
        return `/images/products/${path.relative(PRODUCTS_DIR, fullPath).replace(/\\/g, "/")}`;
      }
    }
  }
  return null;
}

async function seed() {
  console.log("=== Seed de productos e imágenes ===\n");
  
  // Verificar/crear categorías
  console.log("Verificando categorías...");
  for (const catSlug of Object.values(CATEGORY_MAP)) {
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, catSlug)).limit(1);
    if (existing.length === 0) {
      await db.insert(categories).values({ id: randomUUID(), slug: catSlug, name: catSlug.charAt(0).toUpperCase() + catSlug.slice(1), isActive: true });
      console.log(`  ✓ Categoría creada: ${catSlug}`);
    } else {
      console.log(`  - Categoría existe: ${catSlug}`);
    }
  }
  
  // Obtener IDs de categorías
  const catResult = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const catIds = Object.fromEntries(catResult.map(c => [c.slug, c.id]));
  
  // Crear productos
  console.log("\nCreando productos...");
  let created = 0;
  let skipped = 0;
  
  for (const p of MOCK_PRODUCTS) {
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, p.slug)).limit(1);
    let productId: string;
    
    if (existing.length > 0) {
      productId = existing[0].id;
      skipped++;
    } else {
      const catId = catIds[CATEGORY_MAP[p.category as keyof typeof CATEGORY_MAP]];
      if (!catId) {
        console.log(`  ⚠ Categoría no encontrada para ${p.slug}: ${p.category}`);
        continue;
      }
      
      productId = randomUUID();
      await db.insert(products).values({
        id: productId,
        sku: `SKU-${p.slug.toUpperCase()}`,
        name: p.name,
        slug: p.slug,
        price: String(p.price),
        compareAtPrice: p.oldPrice ? String(p.oldPrice) : null,
        stock: p.stock,
        categoryId: catId,
        isActive: true,
      });
      
      created++;
      console.log(`  ✓ Producto creado: ${p.slug} (ID: ${productId})`);
    }
    
    // Registrar imagen -nobg
    const nobgPath = await findNobgImage(p.slug);
    if (nobgPath) {
      const originalPath = nobgPath.replace("-nobg.png", ".png");
      const existingImg = await db.select({ id: productImages.id })
        .from(productImages)
        .where(and(eq(productImages.productId, productId), eq(productImages.image, originalPath)))
        .limit(1);
      
      if (existingImg.length === 0) {
        await db.insert(productImages).values({
          productId,
          image: originalPath,
          processedImage: nobgPath,
          altText: p.name,
          isPrimary: true,
          processingStatus: "completed",
        });
        console.log(`    → Imagen registrada: ${nobgPath}`);
      } else {
        console.log(`    → Imagen ya existe para: ${p.slug}`);
      }
    } else {
      console.log(`    ⚠ No se encontró imagen -nobg para: ${p.slug}`);
    }
  }
  
  console.log(`\n=== Resumen ===`);
  console.log(`Productos creados: ${created}`);
  console.log(`Productos ya existentes: ${skipped}`);
  
  await pool.end();
}

seed().catch(console.error);