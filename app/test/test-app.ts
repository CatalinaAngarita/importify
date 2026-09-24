import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import * as fs from "fs";
import * as path from "path";
import { newDb } from "pg-mem";
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
  db: ReturnType<typeof drizzle<typeof schema>>;
  provider: FakePaymentProvider;
}

export async function createTestApp(): Promise<TestContext> {
  // PostgreSQL en memoria con las migraciones REALES del proyecto.
  const mem = newDb();
  mem.public.registerFunction({
    name: "gen_random_uuid",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    returns: "uuid" as any,
    impure: true,
    implementation: () => randomUUID(),
  });
  const files = fs
    .readdirSync(path.join(__dirname, "..", "drizzle"))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(__dirname, "..", "drizzle", f), "utf8");
    for (const stmt of sql.split("--> statement-breakpoint")) {
      if (stmt.trim()) await mem.public.query(stmt);
    }
  }
  const pg = mem.adapters.createPg();
  // pg-mem no soporta `types.getTypeParser` (que drizzle node-postgres envía)
  // ni LIMIT/OFFSET parametrizados: se normaliza el query config e interpola
  // valores (el SQL ejecutado sigue siendo el real del proyecto).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalize = (q: any) => {
    if (!q || typeof q !== "object") return q;
    q = { ...q };
    delete q.types;
    if (Array.isArray(q.values) && typeof q.text === "string") {
      const values: unknown[] = [...q.values];
      const drop = new Set<number>();
      q.text = q.text.replace(/(limit|offset)\s+\$(\d+)/gi, (_m: string, kw: string, n: string) => {
        const idx = Number(n) - 1;
        const v = values[idx];
        if (Number.isInteger(v)) {
          drop.add(idx);
          return `${kw} ${v}`;
        }
        return _m;
      });
      if (drop.size > 0) {
        const map = new Map<number, number>();
        const kept: unknown[] = [];
        values.forEach((v, i) => {
          if (!drop.has(i)) {
            map.set(i + 1, kept.length + 1);
            kept.push(v);
          }
        });
        q.values = kept;
        q.text = q.text.replace(/\$(\d+)/g, (_m: string, n: string) => `$${map.get(Number(n)) ?? n}`);
      }
    }
    return q;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapClient = (client: any) => {
    const origQuery = client.query.bind(client);
    client.query = async (q: unknown, v?: unknown) => {
      const nq = normalize(q);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wantsArray = (nq as any)?.rowMode === "array";
      if (wantsArray) delete (nq as Record<string, unknown>).rowMode;
      const res = await origQuery(nq, v);
      if (wantsArray && Array.isArray(res?.rows)) {
        // pg-mem no soporta rowMode=array: se convierten las filas-objeto
        // a arreglos en el orden de proyección (igual que el driver pg).
        res.rows = res.rows.map((r: unknown) =>
          Array.isArray(r) ? r : Object.values(r as Record<string, unknown>),
        );
      }
      return res;
    };
    return client;
  };
  const rawPool = new pg.Pool();
  const tmp = wrapClient({ query: rawPool.query.bind(rawPool) });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (rawPool as any).query = tmp.query;
  const origConnect = rawPool.connect.bind(rawPool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (rawPool as any).connect = async (...args: any[]) => wrapClient(await origConnect(...args));
  const pool = rawPool;
  const db = drizzle(pool, { schema });

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
