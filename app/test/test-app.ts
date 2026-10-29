import "dotenv/config";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { randomUUID } from "crypto";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import * as path from "path";
import { ThrottleGuard } from "../src/common/throttle.guard";
import { DATABASE, DatabaseModule } from "../src/database/database.module";
import * as schema from "../src/database/schema";
import { AdminModule } from "../src/admin/admin.module";
import { AuthModule } from "../src/auth/auth.module";
import { CartModule } from "../src/cart/cart.module";
import { CategoriesModule } from "../src/categories/categories.module";
import { CheckoutModule } from "../src/checkout/checkout.module";
import { InventoryModule } from "../src/inventory/inventory.module";
import { JwtAuthGuard } from "../src/auth/jwt-auth.guard";
import { OrdersModule } from "../src/orders/orders.module";
import { PaymentsModule } from "../src/payments/payments.module";
import { ProductsModule } from "../src/products/products.module";
import { UsersModule } from "../src/users/users.module";
import { APP_GUARD } from "@nestjs/core";
import {
  PAYMENT_PROVIDER,
  type ProviderTransaction,
} from "../src/payments/providers/payment-provider.interface";

/** Doble de prueba: pasarela programable (no llama a Wompi). */
export class FakePaymentProvider {
  nextStatus = "PENDING";
  created: unknown[] = [];
  constructor(private readonly secret = "test-integrity-secret") {}

  getName() {
    return "fake";
  }
  async getAcceptanceTokens() {
    return { acceptanceToken: "acc-test", personalAuthToken: "per-test" };
  }
  buildIntegritySignature(args: { reference: string; amountInCents: number; currency: string }) {
    const { createHash } = require("crypto");
    return createHash("sha256")
      .update(`${args.reference}${args.amountInCents}${args.currency}${this.secret}`, "utf8")
      .digest("hex");
  }
  async createTransaction(input: {
    reference: string;
    amountInCents: number;
    currency: string;
    customerEmail: string;
  }): Promise<ProviderTransaction> {
    this.created.push(input);
    return {
      id: `fake-${randomUUID()}`,
      reference: input.reference,
      status: "PENDING",
      amountInCents: input.amountInCents,
      raw: { data: { id: "x" } },
    };
  }
  async getTransaction(id: string): Promise<ProviderTransaction> {
    return { id, reference: "", status: this.nextStatus, amountInCents: 0, raw: {} };
  }
}

export interface TestContext {
  app: INestApplication;
  db: MySql2Database<typeof schema>;
  provider: FakePaymentProvider;
}

const TABLES = [
  "payments",
  "order_items",
  "orders",
  "cart_items",
  "carts",
  "inventory_movements",
  "product_images",
  "products",
  "categories",
  "users",
  "roles",
  "auth_otps",
];

export async function createTestApp(): Promise<TestContext> {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("TEST_DATABASE_URL (o DATABASE_URL) debe apuntar a una base MySQL/MariaDB de pruebas");
  }

  const pool = mysql.createPool({
    uri: url,
    connectionLimit: 5,
    waitForConnections: true,
    charset: "utf8mb4",
    timezone: "Z",
  });

  // Migraciones REALES del proyecto sobre la base de pruebas.
  const db = drizzle(pool, { schema, mode: "default" });
  await migrate(db, { migrationsFolder: path.join(__dirname, "..", "drizzle") });

  // Aislamiento entre suites: vaciar todas las tablas.
  await pool.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of TABLES) {
    await pool.query(`TRUNCATE TABLE \`${table}\``);
  }
  await pool.query("SET FOREIGN_KEY_CHECKS = 1");

  // Roles reales requeridos por el dominio.
  await db.insert(schema.roles).values([{ name: "ADMIN" }, { name: "CUSTOMER" }]);

  const provider = new FakePaymentProvider();
  process.env.WOMPI_INTEGRITY_SECRET = "test-integrity-secret";
  process.env.WOMPI_EVENTS_SECRET = "test-events-secret";
  process.env.WOMPI_PUBLIC_KEY = "pub_test_x";
  process.env.WOMPI_PRIVATE_KEY = "prv_test_x";
  process.env.JWT_SECRET = "test-jwt-secret";

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      JwtModule.register({
        global: true,
        secret: "test-jwt-secret",
        signOptions: { issuer: "importify-app" },
      }),
      DatabaseModule,
      CategoriesModule,
      ProductsModule,
      InventoryModule,
      CartModule,
      OrdersModule,
      CheckoutModule,
      PaymentsModule,
      UsersModule,
      AuthModule,
      AdminModule,
    ],
    providers: [
      { provide: APP_GUARD, useClass: ThrottleGuard },
      { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
  })
    .overrideProvider(DATABASE)
    .useValue(db)
    .overrideProvider(PAYMENT_PROVIDER)
    .useValue(provider)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  return { app, db, provider };
}
