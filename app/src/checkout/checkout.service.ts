import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import { users } from "../database/schema";
import { OrdersService } from "../orders/orders.service";
import { CheckoutDto } from "./dto/checkout.dto";

type Db = ReturnType<typeof getDb>;

const REQUIRED_ADDRESS_FIELDS = ["address", "city"] as const;

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly orders: OrdersService,
  ) {}

  /**
   * Cart → Checkout → Validación → Order → Payment(pending).
   * Todo se recalcula en backend dentro de una transacción (OrdersService):
   * productos, precios, stock (con bloqueo FOR UPDATE), usuario y dirección.
   */
  async checkout(dto: CheckoutDto) {
    // Usuario: si viene userId debe existir y estar activo.
    let userId = dto.userId;
    if (userId) {
      const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) throw new NotFoundException(`Usuario ${userId} no encontrado`);
      if (!user.isActive) throw new BadRequestException("Usuario inactivo");
    }

    // Dirección: objeto con mínimos requeridos.
    if (!dto.shippingAddress || typeof dto.shippingAddress !== "object") {
      throw new BadRequestException("shippingAddress es requerida");
    }
    for (const field of REQUIRED_ADDRESS_FIELDS) {
      const v = (dto.shippingAddress as Record<string, unknown>)[field];
      if (typeof v !== "string" || !v.trim()) {
        throw new BadRequestException(`shippingAddress.${field} es requerida`);
      }
    }

    if (!dto.cartId && !(dto.items?.length)) {
      throw new BadRequestException("Se requiere cartId o items");
    }

    const order = await this.orders.create({
      cartId: dto.cartId,
      items: dto.items,
      userId,
      discountCode: dto.discountCode,
      shippingAddress: dto.shippingAddress,
    });

    // Paso Payment queda pendiente para la etapa Wompi.
    return {
      order,
      payment: {
        status: order.paymentStatus,
        amount: order.total,
        next: "POST /api/payments (etapa Wompi)",
      },
    };
  }
}
