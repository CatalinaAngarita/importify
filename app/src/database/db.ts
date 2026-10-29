import mysql from "mysql2/promise";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./schema";

let db: MySql2Database<typeof schema> | undefined;

export function getDb() {
  if (!db) {
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 10,
      waitForConnections: true,
      charset: "utf8mb4",
      timezone: "Z",
    });

    db = drizzle(pool, { schema, mode: "default" });
  }
  return db;
}
