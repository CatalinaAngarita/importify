import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import * as schema from "../src/database/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { createTestApp, type TestContext } from "./test-app";

describe("Carrito + Checkout + Pedidos + Inventario (e2e real)", () => {
  let app: INestApplication;
  let ctx: TestContext;
  let adminToken = "";
  let productId = "";

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    const [role] = await ctx.db.select().from(schema.roles).where(eq(schema.roles.name, "ADMIN"));
    await ctx.db.insert(schema.users).values({
      email: "admin@test.co",
      passwordHash: await bcrypt.hash("Admin1234", 4),
      roleId: role.id,
    });
    adminToken = (
      await request(app.getHttpServer()).post("/api/auth/login").send({ email: "admin@test.co", password: "Admin1234" }).expect(201)
    ).body.accessToken;
    const prod = await request(app.getHttpServer())
      .post("/api/products")
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ sku: "CART-1", name: "Mouse", slug: "mouse", price: 100000, stock: 5 })
      .expect(201);
    productId = prod.body.id;
  }, 120000);
  afterAll(async () => app.close());

  const srv = () => request(app.getHttpServer());
  const admin = () => ({ Authorization: `Bearer ${adminToken}` });

  it("carrito: crear, agregar (precio backend), stock validado, modificar, vaciar", async () => {
    const cart = (await srv().post("/api/cart").send({}).expect(201)).body;
    // El cliente no puede fijar precio: campo extra → 400.
    await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 1, price: 1 }).expect(400);
    const withItem = (await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 2 }).expect(201)).body;
    expect(Number(withItem.items[0].unitPrice)).toBe(100000);
    expect(withItem.meta.total).toBe(200000);
    // Más que el stock → 400.
    await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 4 }).expect(400);
    const itemId = withItem.items[0].id;
    const updated = (await srv().patch(`/api/cart/${cart.id}/items/${itemId}`).send({ quantity: 3 }).expect(200)).body;
    expect(updated.meta.total).toBe(300000);
    await srv().patch(`/api/cart/${cart.id}/items/${itemId}`).send({ quantity: 99 }).expect(400);
    const cleared = (await srv().delete(`/api/cart/${cart.id}`).expect(200)).body;
    expect(cleared.items.length).toBe(0);
  });

  it("checkout calcula todo en backend, descuenta stock y registra SALE", async () => {
    const cart = (await srv().post("/api/cart").send({}).expect(201)).body;
    await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 2 }).expect(201);
    const res = await srv()
      .post("/api/checkout")
      .send({
        cartId: cart.id,
        discountCode: "IMPORTIFY10",
        shippingAddress: { address: "Calle 1", city: "Bogotá" },
      })
      .expect(201);
    const order = res.body.order;
    // subtotal 200000 − 10% = 180000 → envío gratis no (umbral 200000 neto) → +12000.
    expect(Number(order.subtotal)).toBe(200000);
    expect(Number(order.discount)).toBe(20000);
    expect(Number(order.shippingCost)).toBe(12000);
    expect(Number(order.total)).toBe(192000);
    expect(res.body.payment.status).toBe("PENDING");
    // Stock 5 → 3.
    const prod = (await srv().get("/api/products/slug/mouse").expect(200)).body;
    expect(prod.stock).toBe(3);
    // Movimiento SALE registrado.
    const hist = (
      await srv().get(`/api/inventory/movements?productId=${productId}`).set(admin()).expect(200)
    ).body;
    expect(hist.data.some((m: { movementType: string }) => m.movementType === "SALE")).toBe(true);
    // Carrito vaciado.
    const cartAfter = (await srv().get(`/api/cart/${cart.id}`).expect(200)).body;
    expect(cartAfter.items.length).toBe(0);
  });

  it("cupón inválido y carrito vacío → 400; transición inválida → 400", async () => {
    const cart = (await srv().post("/api/cart").send({}).expect(201)).body;
    await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 1 }).expect(201);
    await srv()
      .post("/api/checkout")
      .send({ cartId: cart.id, discountCode: "NOEXISTE", shippingAddress: { address: "C 1", city: "B" } })
      .expect(400);
    await srv().post("/api/checkout").send({ shippingAddress: { address: "C 1", city: "B" } }).expect(400);
    const order = (
      await srv().post("/api/checkout").send({ cartId: cart.id, shippingAddress: { address: "C 1", city: "B" } }).expect(201)
    ).body.order;
    await srv().patch(`/api/orders/${order.id}/status`).set(admin()).send({ status: "DELIVERED" }).expect(400);
  });

  it("cancelación restaura stock con movimiento CANCELLATION", async () => {
    const before = (await srv().get("/api/products/slug/mouse").expect(200)).body.stock;
    const cart = (await srv().post("/api/cart").send({}).expect(201)).body;
    await srv().post(`/api/cart/${cart.id}/items`).send({ productId, quantity: 1 }).expect(201);
    const order = (
      await srv().post("/api/checkout").send({ cartId: cart.id, shippingAddress: { address: "C 1", city: "B" } }).expect(201)
    ).body.order;
    const cancelled = (
      await srv().patch(`/api/orders/${order.id}/status`).set(admin()).send({ status: "CANCELLED" }).expect(200)
    ).body;
    expect(cancelled.status).toBe("CANCELLED");
    const after = (await srv().get("/api/products/slug/mouse").expect(200)).body.stock;
    expect(after).toBe(before);
    const hist = (
      await srv().get(`/api/inventory/movements?productId=${productId}`).set(admin()).expect(200)
    ).body;
    expect(hist.data.some((m: { movementType: string }) => m.movementType === "CANCELLATION")).toBe(true);
  });
});
