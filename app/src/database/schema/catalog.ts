import {
  boolean,
  decimal,
  index,
  int,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { timestampCol, uuidCol, uuidPk } from "./columns";

export const categories = mysqlTable(
  "categories",
  {
    id: uuidPk(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    image: text("image"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [uniqueIndex("categories_slug_uidx").on(t.slug)],
);

export const products = mysqlTable(
  "products",
  {
    id: uuidPk(),
    sku: varchar("sku", { length: 60 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description"),
    shortDescription: varchar("short_description", { length: 300 }),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 12, scale: 2 }),
    stock: int("stock").notNull().default(0),
    categoryId: uuidCol("category_id").references(() => categories.id),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    uniqueIndex("products_sku_uidx").on(t.sku),
    uniqueIndex("products_slug_uidx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_active_idx").on(t.isActive),
    index("products_featured_idx").on(t.isFeatured),
  ],
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: uuidPk(),
    productId: uuidCol("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    image: text("image").notNull(),
    processedImage: text("processed_image"),
    altText: varchar("alt_text", { length: 200 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    processingStatus: varchar("processing_status", { length: 20 })
      .notNull()
      .default("pending"),
    processingError: text("processing_error"),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    index("product_images_product_idx").on(t.productId),
    index("product_images_primary_idx").on(t.productId, t.isPrimary),
    index("product_images_status_idx").on(t.processingStatus),
  ],
);
