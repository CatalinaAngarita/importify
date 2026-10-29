import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { timestampCol, uuidCol, uuidPk } from "./columns";
import { products } from "./catalog";

const inventoryMovementTypes = [
  "PURCHASE",
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "CANCELLATION",
] as const;

export type InventoryMovementType = (typeof inventoryMovementTypes)[number];

export const inventoryMovements = mysqlTable(
  "inventory_movements",
  {
    id: uuidPk(),
    productId: uuidCol("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    movementType: mysqlEnum("movement_type", [...inventoryMovementTypes]).notNull(),
    quantity: int("quantity").notNull(),
    previousStock: int("previous_stock").notNull(),
    newStock: int("new_stock").notNull(),
    reason: text("reason"),
    reference: varchar("reference", { length: 120 }),
    createdBy: uuidCol("created_by"),
    createdAt: timestampCol("created_at"),
  },
  (t) => [
    index("inventory_movements_product_idx").on(t.productId),
    index("inventory_movements_type_idx").on(t.movementType),
    index("inventory_movements_created_idx").on(t.createdAt),
  ],
);
