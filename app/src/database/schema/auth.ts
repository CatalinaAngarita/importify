import {
  datetime,
  index,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { timestampCol, uuidPk } from "./columns";

export const authOtps = mysqlTable(
  "auth_otps",
  {
    id: uuidPk(),
    email: varchar("email", { length: 255 }).notNull(),
    codeHash: varchar("code_hash", { length: 255 }).notNull(),
    expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
    attempts: int("attempts").notNull().default(0),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    uniqueIndex("auth_otps_email_uidx").on(t.email),
    index("auth_otps_expires_idx").on(t.expiresAt),
  ],
);
