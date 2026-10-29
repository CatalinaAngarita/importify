import {
  decimal,
  index,
  int,
  mysqlTable,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { timestampCol, uuidCol, uuidPk } from "./columns";
import { products } from "./catalog";
import { users } from "./users";

export const carts = mysqlTable(
  "carts",
  {
    id: uuidPk(),
    userId: uuidCol("user_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    index("carts_user_idx").on(t.userId),
    uniqueIndex("carts_user_uidx").on(t.userId),
  ],
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: uuidPk(),
    cartId: uuidCol("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuidCol("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: int("quantity").notNull(),
    // Precio vigente tomado del backend al agregar/actualizar. Nunca del cliente.
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    index("cart_items_cart_idx").on(t.cartId),
    uniqueIndex("cart_items_cart_product_uidx").on(t.cartId, t.productId),
  ],
);
