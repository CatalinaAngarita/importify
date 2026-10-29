import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { char, customType, datetime } from "drizzle-orm/mysql-core";

export const uuidCol = (name: string) => char(name, { length: 36 });

export const uuidPk = (name = "id") =>
  uuidCol(name)
    .primaryKey()
    .$defaultFn(() => randomUUID());

export const timestampCol = (name: string) =>
  datetime(name, { mode: "date" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);

export const jsonCol = customType<{ data: unknown; driverData: string | null }>({
  dataType() {
    return "json";
  },
  toDriver(value: unknown) {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown) {
    return typeof value === "string" ? JSON.parse(value) : value;
  },
});
