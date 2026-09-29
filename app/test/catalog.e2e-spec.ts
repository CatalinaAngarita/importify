import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import * as schema from "../src/database/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { createTestApp, type TestContext } from "./test-app";

describe("Catálogo + permisos (e2e real)", () => {
  let app: INestApplication;
  let ctx: TestContext;
  let adminToken = "";
  let customerToken = "";

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
    // Admin directo en DB (rol ADMIN) + login real.
    const [role] = await ctx.db.select().from(schema.roles).where(eq(schema.roles.name, "ADMIN"));
    await ctx.db.insert(schema.users).values({
      email: "admin@test.co",
      passwordHash: await bcrypt.hash("Admin1234", 4),
      roleId: role.id,
    });
    adminToken = (
      await request(app.getHttpServer()).post("/api/auth/login").send({ email: "admin@test.co", password: "Admin1234" }).expect(201)
    ).body.accessToken;
    await request(app.getHttpServer()).post("/api/auth/register").send({ email: "cli@test.co", password: "Secreta123" }).expect(201);
    customerToken = (
      await request(app.getHttpServer()).post("/api/auth/login").send({ email: "cli@test.co", password: "Secreta123" }).expect(201)
    ).body.accessToken;
  }, 120000);
  afterAll(async () => app.close());

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it("invitado no puede crear productos (401) y CUSTOMER tampoco (403)", async () => {
    await request(app.getHttpServer()).post("/api/products").send({}).expect(401);
    await request(app.getHttpServer()).post("/api/products").set(auth(customerToken)).send({}).expect(403);
  });

  it("ADMIN crea categoría y producto; duplicados → 409; validación → 400", async () => {
    const cat = await request(app.getHttpServer())
      .post("/api/categories")
      .set(auth(adminToken))
      .send({ name: "Tech", slug: "tech" })
      .expect(201);
    await request(app.getHttpServer())
      .post("/api/categories")
      .set(auth(adminToken))
      .send({ name: "Tech", slug: "tech" })
      .expect(409);

    const prod = await request(app.getHttpServer())
      .post("/api/products")
      .set(auth(adminToken))
      .send({ sku: "SKU-1", name: "Laptop", slug: "laptop", price: 1500000, stock: 10, categoryId: cat.body.id })
      .expect(201);
    expect(prod.body.stock).toBe(10);

    await request(app.getHttpServer())
      .post("/api/products")
      .set(auth(adminToken))
      .send({ sku: "SKU-1", name: "Otra", slug: "otra", price: 100 })
      .expect(409);
    await request(app.getHttpServer())
      .post("/api/products")
      .set(auth(adminToken))
      .send({ sku: "X", name: "Y", slug: "y", price: -5 })
      .expect(400);
  });

  it("lectura pública con paginación { data, meta }", async () => {
    const res = await request(app.getHttpServer()).get("/api/products?limit=5").expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    const one = await request(app.getHttpServer()).get("/api/products/slug/laptop").expect(200);
    expect(one.body.sku).toBe("SKU-1");
  });

  it("ADMIN activa/desactiva; CUSTOMER no puede (403)", async () => {
    const { body } = await request(app.getHttpServer()).get("/api/products/slug/laptop").expect(200);
    await request(app.getHttpServer())
      .patch(`/api/products/${body.id}`)
      .set(auth(customerToken))
      .send({ isActive: false })
      .expect(403);
    const updated = await request(app.getHttpServer())
      .patch(`/api/products/${body.id}`)
      .set(auth(adminToken))
      .send({ isActive: false })
      .expect(200);
    expect(updated.body.isActive).toBe(false);
    await request(app.getHttpServer())
      .patch(`/api/products/${body.id}`)
      .set(auth(adminToken))
      .send({ isActive: true })
      .expect(200);
  });
});
