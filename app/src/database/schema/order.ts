import {
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { jsonCol, timestampCol, uuidCol, uuidPk } from "./columns";
import { products } from "./catalog";
import { users } from "./users";

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const paymentStatuses = [
  "PENDING",
  "APPROVED",
  "DECLINED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];

export const orders = mysqlTable(
  "orders",
  {
    id: uuidPk(),
    orderNumber: varchar("order_number", { length: 30 }).notNull(),
    userId: uuidCol("user_id").references(() => users.id, { onDelete: "set null" }),
    status: mysqlEnum("status", [...orderStatuses]).notNull().default("PENDING"),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    shippingCost: decimal("shipping_cost", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    discount: decimal("discount", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    total: decimal("total", { precision: 12, scale: 2 }).notNull(),
    paymentStatus: mysqlEnum("payment_status", [...paymentStatuses])
      .notNull()
      .default("PENDING"),
    shippingAddress: jsonCol("shipping_address"),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    uniqueIndex("orders_number_uidx").on(t.orderNumber),
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: uuidPk(),
    orderId: uuidCol("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuidCol("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    sku: varchar("sku", { length: 60 }).notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    quantity: int("quantity").notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);
