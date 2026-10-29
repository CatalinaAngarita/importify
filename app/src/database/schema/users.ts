import {
  boolean,
  index,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { timestampCol, uuidCol, uuidPk } from "./columns";

// Roles: admin | cliente (semilla en etapa de auth)
export const roles = mysqlTable(
  "roles",
  {
    id: uuidPk(),
    name: varchar("name", { length: 30 }).notNull(),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [uniqueIndex("roles_name_uidx").on(t.name)],
);

export const users = mysqlTable(
  "users",
  {
    id: uuidPk(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    roleId: uuidCol("role_id").references(() => roles.id),
    isActive: boolean("is_active").notNull().default(true),
    refreshTokenHash: text("refresh_token_hash"),
    createdAt: timestampCol("created_at"),
    updatedAt: timestampCol("updated_at"),
  },
  (t) => [
    uniqueIndex("users_email_uidx").on(t.email),
    index("users_role_idx").on(t.roleId),
  ],
);
