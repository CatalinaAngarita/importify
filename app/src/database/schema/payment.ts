import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { jsonCol, timestampCol, uuidCol, uuidPk } from "./columns";
import { orders } from "./order";

// Estados finales documentados por Wompi para una transacción:
// PENDING (recién creada) → APPROVED | DECLINED | VOIDED | ERROR.
const wompiTransactionStatuses = [
  "PENDING",
  "APPROVED",
  "DECLINED",
  "VOIDED",
  "ERROR",
] as const;

export type WompiTransactionStatus = (typeof wompiTransactionStatuses)[number];

export const payments = mysqlTable(
  "payments",
  {
    id: uuidPk(),
    orderId: uuidCol("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // Referencia única propia enviada a Wompi (reference).
    reference: varchar("reference", { length: 255 }).notNull(),
    amountCents: int("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("COP"),
    status: mysqlEnum("status", [...wompiTransactionStatuses])
      .notNull()
      .default("PENDING"),
    wompiTransactionId: varchar("wompi_transaction_id", { length: 60 }),
    customerEmail: varchar("customer_email", { length: 255 }),
    paymentMethodType: varchar("payment_method_type", { length: 30 }),
    rawResponse: jsonCol("raw_response"),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    uniqueIndex("payments_reference_uidx").on(t.reference),
    index("payments_order_idx").on(t.orderId),
    index("payments_wompi_tx_idx").on(t.wompiTransactionId),
  ],
);
