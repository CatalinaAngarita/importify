import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./catalog";

export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "PURCHASE",
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "CANCELLATION",
]);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    movementType: inventoryMovementTypeEnum("movement_type").notNull(),
    quantity: integer("quantity").notNull(),
    previousStock: integer("previous_stock").notNull(),
    newStock: integer("new_stock").notNull(),
    reason: text("reason"),
    reference: varchar("reference", { length: 120 }),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("inventory_movements_product_idx").on(t.productId),
    index("inventory_movements_type_idx").on(t.movementType),
    index("inventory_movements_created_idx").on(t.createdAt),
  ],
);

export type InventoryMovementType =
  (typeof inventoryMovementTypeEnum.enumValues)[number];
