import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createHash } from "crypto";
import * as schema from "../src/database/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { createTestApp, type TestContext } from "./test-app";

describe("Pagos Wompi + seguridad (e2e real)", () => {
  let app: INestApplication;
  let ctx: TestContext;
  let adminToken = "";
  let userAToken = "";
  let userAId = "";
  let productId = "";
  let orderId = "";

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    const [adminRole] = await ctx.db.select().from(schema.roles).where(eq(schema.roles.name, "ADMIN"));
    await ctx.db.insert(schema.users).values({
      email: "admin@test.co",
      passwordHash: await bcrypt.hash("Admin1234", 4),
      roleId: adminRole.id,
    });
    adminToken = (
      await request(app.getHttpServer()).post("/api/auth/login").send({ email: "admin@test.co", password: "Admin1234" }).expect(201)
    ).body.accessToken;
    const reg = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email: "buyer@test.co", password: "Secreta123" })
      .expect(201);
    userAToken = reg.body.accessToken;
    userAId = reg.body.user.id;
    const prod = await request(app.getHttpServer())
      .post("/api/products")
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ sku: "PAY-1", name: "Teclado", slug: "teclado", price: 250000, stock: 4 })
      .expect(201);
    productId = prod.body.id;
    // Pedido del usuario A (2 × 250000 = 500000, envío gratis).
    const cart = (await request(app.getHttpServer()).post("/api/cart").send({}).expect(201)).body;
    await request(app.getHttpServer()).post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 2 }).expect(201);
    orderId = (
      await request(app.getHttpServer())
        .post("/api/checkout")
        .set({ Authorization: `Bearer ${userAToken}` })
        .send({ cartId: cart.id, userId: "00000000-0000-0000-0000-000000000000", shippingAddress: { address: "C 1", city: "B" } })
        .expect(201)
    ).body.order.id;
  }, 120000);
  afterAll(async () => app.close());

  const srv = () => request(app.getHttpServer());

  it("checkout con userId ajeno atribuye al dueño del token (anti-suplantación)", async () => {
    const [order] = await ctx.db.select().from(schema.orders).where(eq(schema.orders.id, orderId));
    expect(order.userId).toBe(userAId);
    expect(Number(order.total)).toBe(500000);
  });

  it("intent usa el total del pedido y firma verificable con SHA256 real", async () => {
    const res = (
      await srv()
        .post("/api/payments/intent")
        .set({ Authorization: `Bearer ${userAToken}` })
        .send({ orderId, customerEmail: "buyer@test.co" })
        .expect(201)
    ).body;
    const { payment, wompi } = res;
    expect(payment.amountCents).toBe(50000000);
    const expected = createHash("sha256")
      .update(`${wompi.reference}${wompi.amountInCents}COPtest-integrity-secret`, "utf8")
      .digest("hex");
    expect(wompi.signature).toBe(expected);
  });

  it("pedido ajeno no lo puede pagar otro usuario (403)", async () => {
    const regB = await srv().post("/api/auth/register").send({ email: "other@test.co", password: "Secreta123" }).expect(201);
    await srv()
      .post("/api/payments/intent")
      .set({ Authorization: `Bearer ${regB.body.accessToken}` })
      .send({ orderId, customerEmail: "other@test.co" })
      .expect(403);
  });

  it("sync APPROVED confirma pedido; el frontend no decide (re-verifica provider)", async () => {
    const intent = (
      await srv()
        .post("/api/payments/intent")
        .set({ Authorization: `Bearer ${userAToken}` })
        .send({ orderId, customerEmail: "buyer@test.co" })
        .expect(201)
    ).body;
    // Sin transacción en Wompi aún: no cambia nada.
    const pending = (await srv().get(`/api/payments/${intent.payment.id}/status`).expect(200)).body;
    expect(pending.payment.status).toBe("PENDING");

    // Intento con método → crea transacción fake PENDING.
    const withMethod = (
      await srv()
        .post("/api/payments/intent")
        .set({ Authorization: `Bearer ${userAToken}` })
        .send({ orderId, customerEmail: "buyer@test.co", paymentMethod: { type: "CARD", token: "tok_x", installments: 1 } })
        .expect(201)
    ).body;
    ctx.provider.nextStatus = "APPROVED";
    const synced = (await srv().get(`/api/payments/${withMethod.payment.id}/status`).expect(200)).body;
    expect(synced.payment.status).toBe("APPROVED");
    const [order] = await ctx.db.select().from(schema.orders).where(eq(schema.orders.id, orderId));
    expect(order.paymentStatus).toBe("APPROVED");
    expect(order.status).toBe("CONFIRMED");
  });

  it("webhook transaction.updated válido aplica; checksum malo → 400", async () => {
    const cart = (await srv().post("/api/cart").send({}).expect(201)).body;
    await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 1 }).expect(201);
    const freshOrder = (
      await srv().post("/api/checkout").send({ cartId: cart.id, shippingAddress: { address: "C 1", city: "B" } }).expect(201)
    ).body.order;
    const intent = (
      await srv()
        .post("/api/payments/intent")
        .send({ orderId: freshOrder.id, customerEmail: "buyer@test.co", paymentMethod: { type: "CARD", token: "tok_y", installments: 1 } })
        .expect(201)
    ).body;
    const reference: string = intent.payment.reference;
    const timestamp = Date.now();
    const tx = { id: "wompi-evt-1", reference, status: "APPROVED", amount_in_cents: intent.payment.amountCents };
    const props = ["id", "status", "amount_in_cents"];
    const checksum = createHash("sha256")
      .update(props.map((p) => String((tx as Record<string, unknown>)[p])).join("") + String(timestamp) + "test-events-secret", "utf8")
      .digest("hex");
    const ok = await srv()
      .post("/api/payments/webhook")
      .send({ event: "transaction.updated", data: { transaction: tx }, signature: { properties: props, checksum }, timestamp })
      .expect(201);
    expect(ok.body.status).toBe("APPROVED");
    // Evento desconocido se ignora.
    await srv().post("/api/payments/webhook").send({ event: "otro.evento" }).expect(201);
    // Checksum manipulado → 400.
    await srv()
      .post("/api/payments/webhook")
      .send({ event: "transaction.updated", data: { transaction: tx }, signature: { properties: props, checksum: "00".repeat(32) }, timestamp })
      .expect(400);
  });

  it("DECLINED cancela pedido y restaura stock", async () => {
    const cart = (await srv().post("/api/cart").send({}).expect(201)).body;
    await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 1 }).expect(201);
    const order = (
      await srv().post("/api/checkout").send({ cartId: cart.id, shippingAddress: { address: "C 1", city: "B" } }).expect(201)
    ).body.order;
    const stockBefore = (await srv().get("/api/products/slug/teclado").expect(200)).body.stock;
    const intent = (
      await srv()
        .post("/api/payments/intent")
        .send({ orderId: order.id, customerEmail: "g@test.co", paymentMethod: { type: "CARD", token: "tok_z", installments: 1 } })
        .expect(201)
    ).body;
    ctx.provider.nextStatus = "DECLINED";
    await srv().get(`/api/payments/${intent.payment.id}/status`).expect(200);
    const [updated] = await ctx.db.select().from(schema.orders).where(eq(schema.orders.id, order.id));
    expect(updated.paymentStatus).toBe("DECLINED");
    expect(updated.status).toBe("CANCELLED");
    const stockAfter = (await srv().get("/api/products/slug/teclado").expect(200)).body.stock;
    expect(stockAfter).toBe(stockBefore + 1);
  });

  it("rate limiting: ráfaga de logins → 429", async () => {
    let limited = 0;
    for (let i = 0; i < 12; i++) {
      const r = await srv().post("/api/auth/login").send({ email: "nadie@test.co", password: "x" });
      if (r.status === 429) limited++;
    }
    expect(limited).toBeGreaterThan(0);
  });
});
