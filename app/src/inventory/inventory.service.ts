import { Injectable, BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import {
  inventoryMovements,
  products,
  type InventoryMovementType,
} from "../database/schema";
import { paginated, PaginationQueryDto } from "../common/dto/pagination.dto";
import { InventoryQueryDto } from "./dto/inventory-query.dto";

type Db = ReturnType<typeof getDb>;

export interface StockChangeInput {
  quantity: number; // > 0
  reason?: string;
  reference?: string;
  createdBy?: string;
}

@Injectable()
export class InventoryService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  /** Entrada de stock. quantity debe ser > 0. */
  async increaseStock(
    productId: string,
    input: StockChangeInput,
    movementType: Extract<
      InventoryMovementType,
      "PURCHASE" | "RETURN" | "ADJUSTMENT" | "CANCELLATION"
    > = "PURCHASE",
  ) {
    this.assertPositiveQuantity(input.quantity);
    return this.applyMovement(productId, input.quantity, movementType, input);
  }

  /** Salida de stock. Nunca permite stock < 0. */
  async decreaseStock(
    productId: string,
    input: StockChangeInput,
    movementType: Extract<InventoryMovementType, "SALE" | "ADJUSTMENT"> = "SALE",
  ) {
    this.assertPositiveQuantity(input.quantity);
    return this.applyMovement(productId, -input.quantity, movementType, input);
  }

  /** Fija el stock a un valor absoluto (>= 0) registrando la diferencia. */
  async adjustStock(productId: string, newStock: number, input: Partial<StockChangeInput> = {}) {
    if (!Number.isInteger(newStock) || newStock < 0) {
      throw new BadRequestException("newStock debe ser un entero >= 0");
    }
    const current = await this.getProductOrThrow(productId);
    const delta = newStock - current.stock;
    if (delta === 0) {
      return { product: current, movement: null };
    }
    return this.applyMovement(productId, delta, "ADJUSTMENT", {
      reason: input.reason ?? `Ajuste a ${newStock}`,
      reference: input.reference,
      createdBy: input.createdBy,
      quantity: Math.abs(delta),
    });
  }

  /** Historial paginado de movimientos. */
  async history(query: InventoryQueryDto) {
    const filters: SQL[] = [];
    if (query.productId) filters.push(eq(inventoryMovements.productId, query.productId));
    if (query.movementType) filters.push(eq(inventoryMovements.movementType, query.movementType));
    const where = filters.length ? and(...filters) : undefined;
    const [rows, [{ value: total }]] = await Promise.all([
      this.db
        .select()
        .from(inventoryMovements)
        .where(where)
        .orderBy(desc(inventoryMovements.createdAt))
        .limit(query.limit)
        .offset(query.offset),
      this.db.select({ value: count() }).from(inventoryMovements).where(where),
    ]);
    return paginated(rows, total, query.page, query.limit);
  }

  private async applyMovement(
    productId: string,
    delta: number,
    movementType: InventoryMovementType,
    input: StockChangeInput,
  ) {
    // Transacción PostgreSQL: lectura, validación, update e inserción atómicas.
    return this.db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
      if (!product) throw new NotFoundException(`Producto ${productId} no encontrado`);

      const previousStock = product.stock;
      const newStock = previousStock + delta;
      if (newStock < 0) {
        throw new BadRequestException(
          `Stock insuficiente: disponible ${previousStock}, solicitado ${Math.abs(delta)}`,
        );
      }

      const [updated] = await tx
        .update(products)
        .set({ stock: newStock, updatedAt: new Date() })
        .where(eq(products.id, productId))
        .returning();

      const [movement] = await tx
        .insert(inventoryMovements)
        .values({
          productId,
          movementType,
          quantity: delta,
          previousStock,
          newStock,
          reason: input.reason,
          reference: input.reference,
          createdBy: input.createdBy,
        })
        .returning();

      return { product: updated, movement };
    });
  }

  private async getProductOrThrow(productId: string) {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!row) throw new NotFoundException(`Producto ${productId} no encontrado`);
    return row;
  }

  private assertPositiveQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException("quantity debe ser un entero > 0");
    }
  }
}
