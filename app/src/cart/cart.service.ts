import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import { cartItems, carts, products } from "../database/schema";
import { AddItemDto, CreateCartDto } from "./dto/cart.dto";

type Db = ReturnType<typeof getDb>;

@Injectable()
export class CartService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  /** Crea un carrito (invitado si no hay userId). Un usuario = un carrito. */
  async create(dto: CreateCartDto = {}) {
    if (dto.userId) {
      const [existing] = await this.db
        .select()
        .from(carts)
        .where(eq(carts.userId, dto.userId))
        .limit(1);
      if (existing) return this.get(existing.id);
    }
    const [row] = await this.db
      .insert(carts)
      .values({ userId: dto.userId })
      .returning();
    return this.get(row.id);
  }

  /** Consulta el carrito con ítems, precios backend y totales. */
  async get(cartId: string) {
    const [cart] = await this.db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);
    if (!cart) throw new NotFoundException(`Carrito ${cartId} no encontrado`);

    const items = await this.db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
        productName: products.name,
        productSlug: products.slug,
        productSku: products.sku,
        productStock: products.stock,
        productActive: products.isActive,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    const detailed = items.map((i) => ({
      ...i,
      subtotal: Number(i.unitPrice) * i.quantity,
    }));
    const total = detailed.reduce((acc, i) => acc + i.subtotal, 0);
    return {
      ...cart,
      items: detailed,
      meta: { count: detailed.length, totalQuantity: detailed.reduce((a, i) => a + i.quantity, 0), total },
    };
  }

  /** Agrega un ítem. Precio siempre desde backend; valida stock y producto activo. */
  async addItem(cartId: string, dto: AddItemDto) {
    await this.assertCartExists(cartId);
    const product = await this.getActiveProductOrThrow(dto.productId);

    return this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, dto.productId)))
        .limit(1);
      const nextQty = (existing?.quantity ?? 0) + dto.quantity;
      this.assertStock(product.stock, nextQty, product.name);

      if (existing) {
        await tx
          .update(cartItems)
          .set({ quantity: nextQty, unitPrice: String(product.price), updatedAt: new Date() })
          .where(eq(cartItems.id, existing.id));
      } else {
        await tx.insert(cartItems).values({
          cartId,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPrice: String(product.price),
        });
      }
      await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
    }).then(() => this.get(cartId));
  }

  /** Modifica la cantidad de un ítem. Valida stock; re-sincroniza precio backend. */
  async updateQuantity(cartId: string, itemId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException("quantity debe ser un entero >= 1");
    }
    await this.assertCartExists(cartId);
    const [item] = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .limit(1);
    if (!item) throw new NotFoundException(`Ítem ${itemId} no encontrado en el carrito`);

    const product = await this.getActiveProductOrThrow(item.productId);
    this.assertStock(product.stock, quantity, product.name);

    await this.db
      .update(cartItems)
      .set({ quantity, unitPrice: String(product.price), updatedAt: new Date() })
      .where(eq(cartItems.id, itemId));
    await this.db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
    return this.get(cartId);
  }

  /** Elimina un ítem del carrito. */
  async removeItem(cartId: string, itemId: string) {
    await this.assertCartExists(cartId);
    const [item] = await this.db
      .select({ id: cartItems.id })
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .limit(1);
    if (!item) throw new NotFoundException(`Ítem ${itemId} no encontrado en el carrito`);
    await this.db.delete(cartItems).where(eq(cartItems.id, itemId));
    return this.get(cartId);
  }

  /** Vacía el carrito (elimina todos los ítems, conserva el carrito). */
  async clear(cartId: string) {
    await this.assertCartExists(cartId);
    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    await this.db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
    return this.get(cartId);
  }

  private async assertCartExists(cartId: string) {
    const [row] = await this.db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);
    if (!row) throw new NotFoundException(`Carrito ${cartId} no encontrado`);
  }

  private async getActiveProductOrThrow(productId: string) {
    const [row] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!row) throw new NotFoundException(`Producto ${productId} no encontrado`);
    if (!row.isActive) throw new BadRequestException(`Producto '${row.name}' no disponible`);
    return row;
  }

  private assertStock(stock: number, requested: number, name: string) {
    if (requested > stock) {
      throw new BadRequestException(
        `Stock insuficiente para '${name}': disponible ${stock}, solicitado ${requested}`,
      );
    }
  }
}
