import { Inject, Injectable } from "@nestjs/common";
import { count, eq, lte, sql } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import { orders, products } from "../database/schema";

type Db = ReturnType<typeof getDb>;

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class AdminService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  /** Ventas (aprobadas), pedidos por estado, stock bajo y agotados. */
  async stats() {
    const [[{ value: ordersCount }], byStatus, [salesRow], lowStock, [{ value: outOfStockCount }]] =
      await Promise.all([
        this.db.select({ value: count() }).from(orders),
        this.db
          .select({ status: orders.status, value: count() })
          .from(orders)
          .groupBy(orders.status),
        this.db
          .select({ sales: sql<string>`coalesce(sum(${orders.total}), 0)` })
          .from(orders)
          .where(eq(orders.paymentStatus, "APPROVED")),
        this.db
          .select({ id: products.id, name: products.name, sku: products.sku, stock: products.stock })
          .from(products)
          .where(lte(products.stock, LOW_STOCK_THRESHOLD))
          .orderBy(products.stock)
          .limit(10),
        this.db.select({ value: count() }).from(products).where(eq(products.stock, 0)),
      ]);
    return {
      sales: Number(salesRow?.sales ?? 0),
      ordersCount,
      ordersByStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.value])),
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      lowStock,
      outOfStock: outOfStockCount,
    };
  }
}
