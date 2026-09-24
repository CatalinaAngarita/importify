import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp, type TestContext } from "./test-app";

describe("Auth + Users (e2e real)", () => {
  let app: INestApplication;
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  }, 120000);
  afterAll(async () => app.close());

  const email = `user-${Date.now()}@test.co`;
  let accessToken = "";

  it("registro crea usuario CUSTOMER y devuelve tokens", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "Secreta123", firstName: "Ana" })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it("registro duplicado → 409", async () => {
    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({ email, password: "Secreta123" })
      .expect(409);
  });

  it("login válido devuelve tokens; login inválido → 401", async () => {
    const ok = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password: "Secreta123" })
      .expect(201);
    expect(ok.body.accessToken).toBeDefined();
    await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password: "otra-clave" })
      .expect(401);
  });

  it("GET /auth/me sin token → 401; con token → usuario sin secretos", async () => {
    await request(app.getHttpServer()).get("/api/auth/me").expect(401);
    const me = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body.email).toBe(email);
    expect(me.body.passwordHash).toBeUndefined();
    expect(me.body.refreshTokenHash).toBeUndefined();
  });

  it("refresh rota tokens y logout revoca", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email, password: "Secreta123" })
      .expect(201);
    const refreshed = await request(app.getHttpServer())
      .post("/api/auth/refresh")
      .send({ refreshToken: login.body.refreshToken })
      .expect(201);
    expect(refreshed.body.accessToken).toBeDefined();
    await request(app.getHttpServer())
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(201);
    // Refresh usado tras logout → 401 (hash revocado).
    await request(app.getHttpServer())
      .post("/api/auth/refresh")
      .send({ refreshToken: login.body.refreshToken })
      .expect(401);
  });
});
