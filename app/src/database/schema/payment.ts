import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./order";

// Estados finales documentados por Wompi para una transacción:
// PENDING (recién creada) → APPROVED | DECLINED | VOIDED | ERROR.
export const wompiTransactionStatusEnum = pgEnum("wompi_transaction_status", [
  "PENDING",
  "APPROVED",
  "DECLINED",
  "VOIDED",
  "ERROR",
]);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // Referencia única propia enviada a Wompi (reference).
    reference: varchar("reference", { length: 255 }).notNull().unique(),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("COP"),
    status: wompiTransactionStatusEnum("status").notNull().default("PENDING"),
    wompiTransactionId: varchar("wompi_transaction_id", { length: 60 }),
    customerEmail: varchar("customer_email", { length: 255 }),
    paymentMethodType: varchar("payment_method_type", { length: 30 }),
    rawResponse: jsonb("raw_response"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_reference_uidx").on(t.reference),
    index("payments_order_idx").on(t.orderId),
    index("payments_wompi_tx_idx").on(t.wompiTransactionId),
  ],
);

export type WompiTransactionStatus =
  (typeof wompiTransactionStatusEnum.enumValues)[number];
