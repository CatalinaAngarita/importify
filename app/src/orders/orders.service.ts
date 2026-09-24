import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import {
  cartItems,
  carts,
  inventoryMovements,
  orderItems,
  orders,
  products,
  type OrderStatus,
} from "../database/schema";
import { paginated, PaginationQueryDto } from "../common/dto/pagination.dto";
import { CreateOrderDto } from "./dto/order.dto";

type Db = ReturnType<typeof getDb>;

// Reglas de negocio backend (nunca confiar en appweb):
const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_FLAT = 12000;
const DISCOUNT_CODES: Record<string, number> = { IMPORTIFY10: 0.1 };

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  async findAll(query: PaginationQueryDto & { userId?: string; status?: OrderStatus }) {
    const filters: SQL[] = [];
    if (query.userId) filters.push(eq(orders.userId, query.userId));
    if (query.status) filters.push(eq(orders.status, query.status));
    const where = filters.length ? and(...filters) : undefined;
    const [rows, [{ value: total }]] = await Promise.all([
      this.db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(query.limit).offset(query.offset),
      this.db.select({ value: count() }).from(orders).where(where),
    ]);
    return paginated(rows, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new NotFoundException(`Pedido ${id} no encontrado`);
    const items = await this.db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  /** Crea el pedido calculando todo en backend, descuenta stock y vacía carrito. */
  async create(dto: CreateOrderDto) {
    // Resolver líneas solicitadas: desde carrito o lista directa (solo productId+quantity).
    let lines: { productId: string; quantity: number }[] = dto.items ?? [];
    let cartId: string | undefined = dto.cartId;
    if (cartId) {
      const [cart] = await this.db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
      if (!cart) throw new NotFoundException(`Carrito ${cartId} no encontrado`);
      const cis = await this.db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
      if (!cis.length) throw new BadRequestException("El carrito está vacío");
      lines = cis.map((c) => ({ productId: c.productId, quantity: c.quantity }));
    }
    if (!lines.length) throw new BadRequestException("El pedido requiere al menos un ítem");
    for (const l of lines) {
      if (!Number.isInteger(l.quantity) || l.quantity < 1) {
        throw new BadRequestException("Cada quantity debe ser un entero >= 1");
      }
    }

    return this.db.transaction(async (tx) => {
      // Snapshot + validación de stock con precios backend.
      let subtotal = 0;
      const snapshots: {
        productId: string; productName: string; sku: string; unitPrice: number; quantity: number; subtotal: number;
      }[] = [];
      for (const l of lines) {
        // Bloqueo de fila (FOR UPDATE) dentro de la transacción: evita
        // condiciones de carrera entre checkouts concurrentes del mismo producto.
        const [p] = await tx
          .select()
          .from(products)
          .where(eq(products.id, l.productId))
          .limit(1)
          .for("update");
        if (!p) throw new NotFoundException(`Producto ${l.productId} no encontrado`);
        if (!p.isActive) throw new BadRequestException(`Producto '${p.name}' no disponible`);
        if (l.quantity > p.stock) {
          throw new BadRequestException(`Stock insuficiente para '${p.name}': disponible ${p.stock}, solicitado ${l.quantity}`);
        }
        const unit = Number(p.price);
        const lineSub = unit * l.quantity;
        subtotal += lineSub;
        snapshots.push({ productId: p.id, productName: p.name, sku: p.sku, unitPrice: unit, quantity: l.quantity, subtotal: lineSub });
      }

      // Backend calcula descuento y envío.
      const rate = dto.discountCode ? (DISCOUNT_CODES[dto.discountCode.toUpperCase()] ?? 0) : 0;
      if (dto.discountCode && !rate) throw new BadRequestException(`Cupón '${dto.discountCode}' inválido`);
      const discount = Math.round(subtotal * rate * 100) / 100;
      const shippingCost = subtotal - discount >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
      const total = Math.round((subtotal - discount + shippingCost) * 100) / 100;

      const orderNumber = `IMP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: dto.userId,
          status: "PENDING",
          subtotal: String(subtotal),
          shippingCost: String(shippingCost),
          discount: String(discount),
          total: String(total),
          paymentStatus: "PENDING",
          shippingAddress: dto.shippingAddress as never,
        })
        .returning();

      await tx.insert(orderItems).values(
        snapshots.map((s) => ({
          orderId: order.id,
          productId: s.productId,
          productName: s.productName,
          sku: s.sku,
          unitPrice: String(s.unitPrice),
          quantity: s.quantity,
          subtotal: String(s.subtotal),
        })),
      );

      // Descuento de stock + movimientos SALE en la misma transacción.
      // Las filas ya están bloqueadas (FOR UPDATE) desde la validación.
      for (const s of snapshots) {
        const [p] = await tx.select().from(products).where(eq(products.id, s.productId)).limit(1);
        const newStock = p!.stock - s.quantity;
        await tx.update(products).set({ stock: newStock, updatedAt: new Date() }).where(eq(products.id, s.productId));
        await tx.insert(inventoryMovements).values({
          productId: s.productId,
          movementType: "SALE",
          quantity: -s.quantity,
          previousStock: p!.stock,
          newStock,
          reason: `Pedido ${orderNumber}`,
          reference: order.id,
        });
      }

      if (cartId) await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

      return { ...order, items: snapshots };
    });
  }

  /** Cambia de estado con transiciones válidas; CANCELLED restaura stock. */
  async updateStatus(id: string, status: OrderStatus) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new NotFoundException(`Pedido ${id} no encontrado`);
    if (order.status === status) return this.findOne(id);
    if (!NEXT_STATUS[order.status].includes(status)) {
      throw new BadRequestException(`Transición inválida: ${order.status} → ${status}`);
    }
    return this.db.transaction(async (tx) => {
      if (status === "CANCELLED" && order.status !== "CANCELLED") {
        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
        for (const it of items) {
          if (!it.productId) continue;
          const [p] = await tx.select().from(products).where(eq(products.id, it.productId)).limit(1);
          if (!p) continue;
          const newStock = p.stock + it.quantity;
          await tx.update(products).set({ stock: newStock, updatedAt: new Date() }).where(eq(products.id, it.productId));
          await tx.insert(inventoryMovements).values({
            productId: it.productId,
            movementType: "CANCELLATION",
            quantity: it.quantity,
            previousStock: p.stock,
            newStock,
            reason: `Cancelación pedido ${order.orderNumber}`,
            reference: order.id,
          });
        }
      }
      await tx.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
    }).then(() => this.findOne(id));
  }
}
