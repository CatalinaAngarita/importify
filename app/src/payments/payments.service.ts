import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { desc, eq } from "drizzle-orm";
import { DATABASE } from "../database/database.module";
import { getDb } from "../database/db";
import {
  inventoryMovements,
  orderItems,
  orders,
  payments,
  products,
  type WompiTransactionStatus,
} from "../database/schema";
import { PAYMENT_PROVIDER, type PaymentProvider } from "./providers/payment-provider.interface";
import { CreatePaymentIntentDto } from "./dto/payment.dto";

type Db = ReturnType<typeof getDb>;

const FINAL_APPROVED = "APPROVED";
const FINAL_DECLINED = new Set(["DECLINED", "VOIDED", "ERROR"]);

function toCents(total: string | number): number {
  return Math.round(Number(total) * 100);
}

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DATABASE) private readonly db: Db,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
    private readonly config: ConfigService,
  ) {}

  /** Datos públicos para inicializar el Widget en appweb (sin secretos). */
  async getPublicConfig() {
    const tokens = await this.provider.getAcceptanceTokens();
    return {
      provider: this.provider.getName(),
      publicKey: this.config.get<string>("WOMPI_PUBLIC_KEY") ?? null,
      ...tokens,
    };
  }

  /**
   * Crea el intento de pago. El monto sale de orders.total (nunca de appweb).
   * Si el pedido pertenece a un usuario, solo ese usuario (JWT) puede pagarlo.
   * Si llega paymentMethod se crea la transacción en Wompi; si no, se devuelve
   * firma + acceptance para que el frontend la cree vía Widget.
   */
  async createIntent(dto: CreatePaymentIntentDto, requesterId: string | null = null) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, dto.orderId)).limit(1);
    if (!order) throw new NotFoundException(`Pedido ${dto.orderId} no encontrado`);
    if (order.userId && order.userId !== requesterId) {
      throw new ForbiddenException("Este pedido pertenece a otro usuario");
    }
    if (order.status === "CANCELLED") throw new BadRequestException("El pedido está cancelado");
    if (order.paymentStatus === "APPROVED") throw new BadRequestException("El pedido ya fue pagado");

    const amountInCents = toCents(order.total);
    if (amountInCents <= 0) throw new BadRequestException("Total del pedido inválido");
    const currency = "COP";
    const reference = `${order.orderNumber}-${Date.now().toString(36).toUpperCase()}`;

    const tokens = await this.provider.getAcceptanceTokens();
    const signature = this.provider.buildIntegritySignature({ reference, amountInCents, currency });

    const [payment] = await this.db
      .insert(payments)
      .values({
        orderId: order.id,
        reference,
        amountCents: amountInCents,
        currency,
        status: "PENDING",
        customerEmail: dto.customerEmail,
        paymentMethodType: typeof dto.paymentMethod?.["type"] === "string" ? (dto.paymentMethod["type"] as string) : undefined,
      })
      .returning();

    // Sin método aún: appweb completa con Widget usando estos datos.
    if (!dto.paymentMethod) {
      return { payment, wompi: { reference, amountInCents, currency, signature, ...tokens } };
    }

    const tx = await this.provider.createTransaction({
      reference,
      amountInCents,
      currency,
      customerEmail: dto.customerEmail,
      acceptanceToken: tokens.acceptanceToken,
      personalAuthToken: tokens.personalAuthToken,
      signature,
      paymentMethod: dto.paymentMethod,
      redirectUrl: dto.redirectUrl,
      customerData: dto.customerData,
      sessionId: dto.sessionId,
    });

    const [updated] = await this.db
      .update(payments)
      .set({
        status: tx.status as WompiTransactionStatus,
        wompiTransactionId: tx.id,
        paymentMethodType: tx.paymentMethodType ?? undefined,
        rawResponse: tx.raw as never,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))
      .returning();

    // Si Wompi ya devolvió estado final sincrónico, aplicarlo.
    await this.applyProviderStatus(updated.id, tx.status);
    return { payment: updated, wompiTransaction: tx };
  }

  /** El frontend NUNCA decide el resultado: se re-verifica contra Wompi. */
  async syncStatus(paymentId: string) {
    const [payment] = await this.db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
    if (!payment) throw new NotFoundException(`Pago ${paymentId} no encontrado`);
    if (!payment.wompiTransactionId) {
      return { payment, note: "Sin transacción en Wompi todavía" };
    }
    const tx = await this.provider.getTransaction(payment.wompiTransactionId);
    await this.applyProviderStatus(payment.id, tx.status, tx);
    const [refreshed] = await this.db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
    return { payment: refreshed, wompiTransaction: tx };
  }

  async findByOrder(orderId: string) {
    return this.db.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt));
  }

  /**
   * Webhook Wompi: evento transaction.updated.
   * Valida checksum SHA256 (signature.properties en orden + timestamp + secreto
   * de eventos) y solo entonces actualiza Payment/Order/Inventory.
   */
  async handleWebhook(body: {
    event?: string;
    data?: { transaction?: { id?: string; reference?: string; status?: string; amount_in_cents?: number } };
    signature?: { properties?: string[]; checksum?: string };
    timestamp?: number | string;
    sent_at?: string;
  }, checksumHeader?: string) {
    if (body.event !== "transaction.updated") {
      return { ignored: true, reason: `Evento ${body.event} no manejado` };
    }
    const txData = body.data?.transaction;
    if (!txData?.reference) throw new BadRequestException("Webhook sin transaction.reference");

    this.assertWebhookChecksum(body, checksumHeader);

    // El backend verifica el pago consultando a Wompi (no confía solo en el webhook).
    let status = txData.status ?? "PENDING";
    try {
      if (txData.id) {
        const fresh = await this.provider.getTransaction(txData.id);
        status = fresh.status;
        await this.applyProviderStatusByReference(txData.reference, status, fresh);
        return { ok: true, reference: txData.reference, status };
      }
    } catch {
      // Si Wompi no responde, se aplica el estado del evento validado.
    }
    await this.applyProviderStatusByReference(txData.reference, status);
    return { ok: true, reference: txData.reference, status };
  }

  private assertWebhookChecksum(body: {
    data?: { transaction?: Record<string, unknown> };
    signature?: { properties?: string[]; checksum?: string };
    timestamp?: number | string;
    sent_at?: string;
  }, checksumHeader?: string) {
    const secret = this.config.get<string>("WOMPI_EVENTS_SECRET") ?? "";
    if (!secret) throw new BadRequestException("WOMPI_EVENTS_SECRET no configurada");
    const props = body.signature?.properties ?? [];
    const tx = body.data?.transaction ?? {};
    const ts = body.timestamp ?? body.sent_at ?? "";
    const concat = props.map((p) => String(tx[p] ?? "")).join("") + String(ts) + secret;
    const expected = createHash("sha256").update(concat, "utf8").digest("hex");
    const received = body.signature?.checksum ?? checksumHeader ?? "";
    if (!received || received.toLowerCase() !== expected.toLowerCase()) {
      throw new BadRequestException("Checksum del webhook inválido");
    }
  }

  private async applyProviderStatusByReference(reference: string, status: string, tx?: { id?: string; paymentMethodType?: string; raw?: unknown }) {
    const [payment] = await this.db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
    if (!payment) throw new NotFoundException(`Pago con referencia ${reference} no encontrado`);
    await this.applyProviderStatus(payment.id, status, tx);
  }

  /** Actualiza Payment + Order + Inventory según estado final de Wompi. */
  private async applyProviderStatus(paymentId: string, status: string, tx?: { id?: string; paymentMethodType?: string; raw?: unknown }) {
    const normalized = status.toUpperCase();
    await this.db.transaction(async (t) => {
      const [payment] = await t.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
      if (!payment) return;
      // Idempotencia: no reprocesar un pago ya final.
      if (payment.status !== "PENDING") return;
      if (!["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"].includes(normalized)) return;

      await t
        .update(payments)
        .set({
          status: normalized as WompiTransactionStatus,
          ...(tx?.id ? { wompiTransactionId: tx.id } : {}),
          ...(tx?.paymentMethodType ? { paymentMethodType: tx.paymentMethodType } : {}),
          ...(tx?.raw ? { rawResponse: tx.raw as never } : {}),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      const [order] = await t.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1);
      if (!order) return;

      if (normalized === FINAL_APPROVED) {
        await t
          .update(orders)
          .set({ paymentStatus: "APPROVED", status: "CONFIRMED", updatedAt: new Date() })
          .where(eq(orders.id, order.id));
      } else if (FINAL_DECLINED.has(normalized)) {
        await t
          .update(orders)
          .set({ paymentStatus: "DECLINED", status: "CANCELLED", updatedAt: new Date() })
          .where(eq(orders.id, order.id));
        // Restaura el stock reservado al crear el pedido.
        const items = await t.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        for (const it of items) {
          if (!it.productId) continue;
          const [p] = await t.select().from(products).where(eq(products.id, it.productId)).limit(1);
          if (!p) continue;
          const newStock = p.stock + it.quantity;
          await t.update(products).set({ stock: newStock, updatedAt: new Date() }).where(eq(products.id, it.productId));
          await t.insert(inventoryMovements).values({
            productId: it.productId,
            movementType: "CANCELLATION",
            quantity: it.quantity,
            previousStock: p.stock,
            newStock,
            reason: `Pago ${normalized} pedido ${order.orderNumber}`,
            reference: order.id,
          });
        }
      }
    });
  }
}
