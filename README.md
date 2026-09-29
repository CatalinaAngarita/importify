# IMPORTIFY

E-commerce completo para venta de productos importados (tecnología, automotriz, accesorios y cuidado personal) con pagos Wompi para Colombia.

## Descripción

IMPORTIFY es un monorepo con dos aplicaciones principales:

- `app/`: aplicación con NestJS + TypeScript + Drizzle ORM. Expone la API REST y la lógica de negocio.
- `appweb/`: aplicación con Next.js + React + TypeScript. Interfaz pública, catálogo, carrito y checkout.

> No Django. No Python en `app`. No Prisma. No TypeORM.

## Objetivo

Construir por etapas un e-commerce funcional, limpio y desplegable con Docker: catálogo, inventario, carrito, pedidos, checkout y pagos con Wompi.

### Cliente

- Ver, buscar y filtrar productos; ver categorías y detalle.
- Carrito: agregar, modificar cantidades, eliminar.
- Cuenta: registro, inicio de sesión, gestión de datos y direcciones.
- Compra: checkout, selección de método de pago, pago, confirmación.
- Post-compra: consultar pedidos y sus estados.

### Administrador

- Productos: crear, editar, activar/desactivar, gestionar precios e imágenes.
- Categorías e inventario: gestionar categorías, stock y consultar movimientos.
- Operación: consultar pedidos y cambiar estados, consultar clientes y pagos.

## Tecnologías

| Capa | Tecnología |
| ---- | ---------- |
| `app` | NestJS, TypeScript |
| `appweb` | Next.js, React, TypeScript |
| Base de datos | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Infraestructura | Docker, Docker Compose |
| Pagos | Wompi (Colombia) |

## Arquitectura

```
appweb (Next.js) ──HTTP/REST──> app (NestJS) ──Drizzle──> PostgreSQL
                                         └──> Wompi (pagos)
```

- `app` es la única que accede a la base de datos.
- `appweb` consume la API de `app`. No accede directo a la DB.
- Docker Compose orquesta `db` + `app` + `appweb` con healthchecks y volumen persistente.

## Estructura final

```
importify/
├── app/
│   ├── src/
│   │   ├── admin/        # GET /admin/stats (solo ADMIN)
│   │   ├── auth/         # register/login/refresh, JWT, RolesGuard, Throttle
│   │   ├── cart/         # carrito
│   │   ├── categories/   # categorías
│   │   ├── checkout/     # POST /checkout
│   │   ├── common/       # paginación, ThrottleGuard
│   │   ├── database/     # DatabaseModule, db.ts, schema/
│   │   ├── inventory/    # stock + movimientos
│   │   ├── orders/       # pedidos
│   │   ├── payments/     # intent, webhook, providers/wompi
│   │   ├── products/     # productos
│   │   └── users/        # usuarios (solo ADMIN lista)
│   ├── drizzle/          # 6 migraciones SQL + meta/_journal
│   ├── test/             # harness + 4 suites e2e (Etapa 20)
│   ├── Dockerfile
│   └── .dockerignore
├── appweb/
│   ├── app/              # rutas: /, productos, carrito, checkout, login,
│   │                     # registro, mi-cuenta, admin/*
│   ├── components/       # UI + ApiState + AdminGuard
│   ├── services/         # api, auth, products, categories, cart, orders,
│   │                     # checkout, payments, admin, inventory
│   ├── hooks/            # useApi (loading/success/error/empty), useSearch
│   ├── types/            # api.ts, catalog.ts
│   ├── public/images/    # brand, home, banners, categories,
│   │                     # products/<categoria>, testimonials
│   ├── Dockerfile
│   └── .dockerignore
├── database/             # referencia DBeaver
├── docker-compose.yml    # db + app + appweb
├── .env.example
└── README.md
```

No se crean README separados por módulo salvo necesidad estricta. Este es el documento principal.

## Instalación

Requisitos: Node.js 20+, Docker + Docker Compose, Git.

```powershell
git clone <url> importify
Set-Location importify
Copy-Item .env.example .env  # solo primera vez
docker compose up -d --build # db + app + appweb
docker compose ps            # verificar (los 3 healthy)
```

Desarrollo sin Docker:

```powershell
Copy-Item .env.example .env
docker compose up -d db
Set-Location app
npm install
npm run drizzle:migrate
npm run start:dev  # http://localhost:3001/api/health
Set-Location ../appweb
npm install
npm run dev        # http://localhost:3000
```

## Variables de entorno

Ver `.env.example`. Nunca commitear `.env` ni secretos reales.

| Variable | Uso |
| -------- | --- |
| `POSTGRES_USER` | Usuario PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña PostgreSQL (solo local) |
| `POSTGRES_DB` | Nombre de la base de datos |
| `POSTGRES_PORT` | Puerto publicado (5432) |
| `DATABASE_URL` | Conexión usada por Drizzle en `app` (compose inyecta host `db`) |
| `APP_PORT` | Puerto de `app` (3001) |
| `APPWEB_PORT` | Puerto de `appweb` (3000) |
| `NEXT_PUBLIC_API_URL` | URL de la API para el navegador (`http://localhost:3001/api`) |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma |
| `JWT_SECRET` | Secreto JWT (obligatorio en producción) |
| `JWT_ACCESS_TTL` | Vida del access token (15m) |
| `JWT_REFRESH_TTL` | Vida del refresh token (7d) |
| `WOMPI_ENV` | `sandbox` o `production` |
| `WOMPI_PUBLIC_KEY` | Llave pública Wompi (única que llega a `appweb`) |
| `WOMPI_PRIVATE_KEY` | Llave privada Wompi (solo `app`) |
| `WOMPI_INTEGRITY_SECRET` | Secreto de firma de integridad (solo `app`) |
| `WOMPI_EVENTS_SECRET` | Secreto de checksum de webhooks (solo `app`) |

## Ejecución local

### PostgreSQL (servicio `db`)

```powershell
# Levantar
Copy-Item .env.example .env  # solo primera vez
docker compose up -d db

# Verificar estado y salud
docker compose ps
docker exec importify-db pg_isready -U importify

# Revisar logs
docker compose logs db --tail 50
docker compose logs -f db  # seguir en vivo

# Detener (conserva datos en volumen pgdata)
docker compose stop db
# Detener y eliminar contenedor (conserva volumen)
docker compose down
# Eliminar también datos (cuidado: borra la DB local)
docker compose down -v

# Ejecutar migraciones (desde app, única con acceso a DB)
Set-Location app
npm run drizzle:migrate
```

```powershell
# app (NestJS verificado)
Set-Location app
npm install
npm run build
npm run start:dev  # http://localhost:3001/api/health
## `appweb` (diseño + conexión)

Next.js 14 + React 18 + TS. Identidad azul/lila sobre morado oscuro, tarjetas
redondeadas, responsive. Todo visual con **datos mock** (`services/catalog.mock.ts`,
pool único de 12 productos sin repetir entre secciones).

- Header global: logo, buscador (→ `/productos?q=`), carrito con contador,
  Inicio, Productos, Quiénes somos (`/#nosotros`), Contacto (`/#contacto`), login.
- Home `/`: hero, categorías, beneficios, destacados, más vendidos, quiénes somos, testimonios.
- Rutas: `/productos` (filtro por categoría + búsqueda), `/productos/[slug]`
  (detalle + relacionados), `/carrito`, `/login`, `/registro`, `/checkout`
  (pasos + resumen), `/mi-cuenta` (pedidos mock).
- Componentes reutilizables en `components/`: `Container`, `Header`, `Footer`,
  `SectionTitle`, `CategoryCard`, `ProductCard`, `BenefitCard`, `TestimonialCard`,
  `ApiState` (loading/error/empty).
- Home `/` y detalle `/productos/[slug]` siguen con mocks visuales.

## `appweb` conectada a `app`

- Servicios en `appweb/services/`: `api.ts` (cliente central, token en
  localStorage, `ApiError`), `auth.service.ts` (register/login/me), `products`,
  `categories`, `cart` (carrito persistido en localStorage), `orders`,
  `checkout`, `payments`. Tipos en `types/api.ts`. Base única
  `NEXT_PUBLIC_API_URL` (ver `appweb/.env.example`); ningún componente repite URLs.
- Hook `hooks/useApi.ts`: estados `idle|loading|success|error|empty` + `reload`.
- Páginas conectadas: `/productos` (API + fallback a mocks si no hay conexión),
  `/carrito` (ver/cantidad/eliminar/vaciar), `/checkout` (checkout → intent de
  pago Wompi → `/mi-cuenta`), `/mi-cuenta` (pedidos API, requiere login),
  `/login` y `/registro` (token real).
- Panel `/admin` (Etapa 17, solo ADMIN vía `AdminGuard` + `GET /auth/me`):
  `dashboard` (ventas aprobadas, pedidos por estado, stock bajo, agotados),
  `products` (crear, activar/desactivar), `categories` (crear, activar/desactivar),
  `inventory` (entradas, salidas, ajustes, historial), `orders` (consultar,
  cambiar estado), `customers` (consulta). Servicios `admin.service.ts`
  (`/admin/stats`, `/users`) e `inventory.service.ts` con JWT.

```powershell
Set-Location appweb
npm run dev  # http://localhost:3000
```

## Docker

Tres servicios en `docker-compose.yml`, red `importify-net`, volúmenes y
healthchecks con `depends_on`:

| Servicio | Imagen / build | Puerto | Healthcheck | Depende de |
| -------- | -------------- | ------ | ----------- | ---------- |
| `db` | `postgres:16-alpine` | 5432 | `pg_isready` | — |
| `app` | `app/Dockerfile` (Node 20, build TS, migra + inicia) | 3001 | `GET /api/health` | `db` saludable |
| `appweb` | `appweb/Dockerfile` (Node 20, build Next) | 3000 | `GET /` | `app` saludable |

- `app` usa `DATABASE_URL` con host `db` (inyectado por compose, no localhost);
  al arrancar ejecuta `node migrate.cjs` (migraciones vía `drizzle-orm`,
  dependencia de producción) y luego `node dist/main.js`.
- `appweb` recibe `NEXT_PUBLIC_API_URL` como build-arg y variable (navegador →
  `http://localhost:3001/api`).
- Volumen `pgdata` persistente: `docker compose down` NO borra datos (solo
  `down -v` los elimina).

```powershell
Copy-Item .env.example .env  # solo primera vez
docker compose up -d --build # levanta db + app + appweb (modo producción)
docker compose ps            # estado y salud
docker compose logs -f app   # logs (db | appweb)
docker compose down          # detiene y conserva datos (pgdata intacto)
docker compose down -v       # cuidado: borra también los datos
```

### Modo desarrollo (cambios inmediatos)

Las imágenes de producción congelan el código: hay que reconstruir para ver
cambios. `docker-compose.dev.yml` monta el código en vivo con recarga
automática (nodemon con polling en `app`, HMR en `appweb`):

```powershell
# Detener producción primero (mismos puertos/nombres)
docker compose down
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

- Guardas un `.ts` en `app/src` → `app` reinicia solo (~5-10 s).
- Guardas en `appweb/app|components|services|…` → el navegador actualiza solo (HMR).
- Solo la primera levantada construye imágenes; después es guardar + ver.
- Para volver a producción: `docker compose down` y `docker compose up -d --build`.

## Base de datos

- PostgreSQL 16 en servicio `db` (puerto 5432, volumen persistente `pgdata`).
- `app` es la única con acceso directo.
- Esquemas en `app/src/database/schema/`: `users.ts` (roles, users),
  `catalog.ts` (categories, products, productImages), `inventory.ts`
  (inventoryMovements), `cart.ts` (carts, cartItems), `order.ts` (orders,
  orderItems), `payment.ts` (payments). UUID PK `defaultRandom()`, FKs con
  `ON DELETE CASCADE` / `SET NULL` según dominio, uniques, índices,
  `created_at/updated_at` con `defaultNow()`.

### Conexión en DBeaver (desarrollo local)

Proyecto levantado con: `docker compose up -d db` (contenedor `importify-db`, healthy).

| Campo | Valor |
| ----- | ----- |
| Tipo | PostgreSQL |
| Nombre | `importify-local` |
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `importify` |
| Usuario | `importify` |
| Contraseña | `123` (solo local, ver `.env`) |
| URL JDBC | `jdbc:postgresql://localhost:5432/importify` |

Pasos: DBeaver → Nueva conexión → PostgreSQL → ingresar datos → Test Connection → Finalizar.
Archivo de referencia para importar: `database/dbeaver-importify-local.json`.

## Migraciones

Viven en `app/drizzle/` (6 archivos + `meta/_journal.json`).

| Migración | Contenido |
| --------- | --------- |
| `0000_legal_nick_fury` | roles, users, categories, product_images, products |
| `0001_add-refresh-token` | `users.refresh_token_hash` |
| `0002_cultured_moira_mactaggert` | `inventory_movements` + enum |
| `0003_skinny_barracuda` | `carts`, `cart_items` |
| `0004_famous_silverclaw` | `orders`, `order_items` + enums |
| `0005_grey_shadowcat` | `payments` + enum |

```powershell
Set-Location app
$env:DATABASE_URL="postgresql://importify:123@localhost:5432/importify"
npm run drizzle:generate  # tras cambiar el schema
npm run drizzle:migrate   # aplicar (el contenedor app lo hace al arrancar)
npm run drizzle:studio
```

## API

Base: `http://localhost:3001/api` (prefijo global `api`). Respuestas de lista
paginadas `{ data, meta: { total, page, limit, pages } }`.

| Área | Endpoints principales |
| ---- | --------------------- |
| Salud | `GET /api/health` |
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `POST /logout` (JWT), `GET /me` |
| Productos | `GET /api/products` (filtros, orden), `/slug/:slug`, `/:id`; `POST/PATCH/DELETE` solo ADMIN |
| Categorías | `GET /api/categories`, `/:id`; `POST/PATCH/DELETE` solo ADMIN |
| Inventario | `GET /api/inventory/movements`; `POST .../increase\|decrease`, `PATCH .../adjust` (solo ADMIN) |
| Carrito | `POST/GET /api/cart…`, `POST :id/items`, `PATCH :id/items/:itemId`, `DELETE …` |
| Pedidos | `GET /api/orders`, `/:id`, `POST` (público), `PATCH :id/status` (solo ADMIN) |
| Checkout | `POST /api/checkout` |
| Pagos | `GET /payments/public-config`, `POST /intent`, `GET /:id/status`, `GET /by-order/:orderId`, `POST /webhook` |
| Admin | `GET /api/admin/stats` (solo ADMIN) |
| Usuarios | `GET /api/users` (solo ADMIN) |

Códigos: 400 validación/regla de negocio, 401 sin JWT, 403 sin rol, 404 ausente,
409 duplicado, 429 rate limit.

## Productos y Categorías

Módulos `products` y `categories` (controllers, services, DTOs con
class-validator, `DatabaseModule` global). Respuesta paginada
`{ data, meta: { total, page, limit, pages } }`. Lectura pública con filtros
(`q`, `categoryId`/`categorySlug`, `isActive`, `isFeatured`, `isBestSeller`,
`minPrice`, `maxPrice`, paginación, orden); mutaciones solo ADMIN; SKU y slug
únicos (409 si duplicado).

## Autenticación

Registro/login con JWT (`access` 15m + `refresh` 7d hasheado con bcrypt, rotación
con revocación en logout), roles `ADMIN|CUSTOMER` (`RolesGuard`, JWT falla sin
`JWT_SECRET` en producción). `GET /auth/me` para el guard del panel.

## Seguridad (auditoría)

- **JWT**: `typ` separado (access/refresh), expiración corta, refresh hasheado y
  revocable; secreto obligatorio en producción (falla al arrancar sin él).
- **Roles**: mutaciones de productos/categorías, inventario completo,
  `GET /users`, `GET /admin/stats` y cambio de estado de pedidos solo ADMIN;
  lectura de catálogo y carrito públicas; checkout/invitados públicos.
- **CORS**: lista cerrada desde `CORS_ORIGINS` con credenciales.
- **Validación**: `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`,
  `transform`) + DTOs con `class-validator` en todos los módulos.
- **XSS**: sin `dangerouslySetInnerHTML` en `appweb` (React escapa por defecto).
- **SQL injection**: Drizzle parametriza todo; el único `sql` usa referencias de
  columna, nunca interpola entrada.
- **Rate limiting**: `ThrottleGuard` global (120 req/min por IP, en memoria) +
  `login/register` 10/min, `refresh` 20/min, `payments/intent` 30/min.
- **Webhooks**: checksum SHA256 validado + re-consulta a Wompi antes de aplicar;
  idempotente (no reprocesa pagos finalizados).
- **Inventario/pedidos/precios/totales**: 100% backend (precio desde
  `products.price`, envío/descuentos por reglas, `FOR UPDATE` anti-carreras,
  stock nunca < 0). El cliente no puede fijar precio, total, stock, estado de
  pago ni estados administrativos.
- **Anti-suplantación**: en `/checkout`, `POST /orders` y `POST /payments/intent`
  el `userId` del JWT prevalece sobre el del body; un pedido con dueño solo lo
  paga su dueño (403 si no).
- **Secretos**: solo por entorno (`.env`, nunca en código ni README);
  `public-config` expone únicamente llave pública + acceptance tokens.

## Inventario

- Esquema `app/src/database/schema/inventory.ts`: tabla `inventory_movements`
  (`id`, `product_id` FK cascade, `movement_type` enum
  `PURCHASE|SALE|RETURN|ADJUSTMENT|CANCELLATION`, `quantity` con signo,
  `previous_stock`, `new_stock`, `reason`, `reference`, `created_by`, `created_at`),
  índices por producto, tipo y fecha. Migración `0002_*` aplicada.
- `InventoryService` (`app/src/inventory/`): `increaseStock()`, `decreaseStock()`,
  `adjustStock()` + `history()`. Toda modificación corre en transacción Drizzle
  (select → validación → update → insert); nunca permite `stock < 0` (400 si
  insuficiente o cantidad inválida, 404 si el producto no existe).
- `ProductsService.update()` delega cambios de `stock` a `adjustStock()`; el resto
  de campos se actualiza normal. Endpoints `GET /api/inventory/movements`
  (`productId`, `movementType`, paginación), `POST /api/inventory/products/:id/increase|decrease`
  y `PATCH /api/inventory/products/:id/adjust` (`{ quantity, reason?, reference? }`).

## Carrito

- Esquema `app/src/database/schema/cart.ts`: `carts` (`id`, `user_id` único
  nullable para invitado/usuario, timestamps) y `cart_items` (`id`, `cart_id` FK
  cascade, `product_id` FK cascade, `quantity`, `unit_price` snapshot backend,
  único por `(cart_id, product_id)`). Migración `0003_*` aplicada.
- `CartService` (`app/src/cart/`): crear, consultar (ítems + `subtotal`,
  `meta { count, totalQuantity, total }`), agregar, modificar cantidad, eliminar
  ítem, vaciar. Transacción al agregar; precio siempre desde `products.price`
  (nunca del cliente); valida producto activo y `stock` (400 si insuficiente).
- Endpoints `POST /api/cart`, `GET /api/cart/:id`, `POST /api/cart/:id/items`
  (`{ productId, quantity }`), `PATCH /api/cart/:id/items/:itemId`
  (`{ quantity }`), `DELETE /api/cart/:id/items/:itemId`, `DELETE /api/cart/:id`
  (vaciar). 404 si carrito/ítem/producto ausente.

## Pedidos

- Esquema `app/src/database/schema/order.ts`: enums `order_status`
  (`PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED`) y `payment_status`
  (`PENDING|APPROVED|DECLINED|CANCELLED|REFUNDED`); `orders` (`id`,
  `order_number` único, `user_id`, `status`, `subtotal`, `shipping_cost`,
  `discount`, `total`, `payment_status`, `shipping_address`, timestamps) y
  `order_items` (`order_id` cascade, `product_id` set-null, snapshot
  `productName`, `sku`, `unitPrice`, `quantity`, `subtotal`). Migración `0004_*`.
- `OrdersService` (`app/src/orders/`): `create()` acepta `{ cartId }` o
  `items [{ productId, quantity }]`; todo calculado en backend (precio desde
  `products`, cupón `IMPORTIFY10` = 10%, envío $12.000 gratis desde $200.000
  neto); valida activo + stock; en una transacción crea pedido + ítems snapshot,
  descuenta stock con movimientos `SALE` y vacía el carrito.
  `updateStatus()` solo transiciones válidas; `CANCELLED` restaura stock con
  movimientos `CANCELLATION`.
- Endpoints `GET /api/orders`, `GET /api/orders/:id` (con ítems),
  `POST /api/orders`, `PATCH /api/orders/:id/status` (`{ status }`).

## Checkout

- `POST /api/checkout` (`app/src/checkout/`): flujo
  Cart → Checkout → Validación → Order → Payment(pendiente). Body
  `{ cartId | items [{ productId, quantity }], userId?, discountCode?, shippingAddress { address, city, … }, paymentMethod? }`.
- Valida usuario (existe y activo), dirección (`address`, `city` requeridos),
  productos (existen y activos), precios (siempre desde `products.price`) y
  stock. Todo recalculado en backend vía `OrdersService.create()` en una
  transacción; filas de producto bloqueadas con `FOR UPDATE` contra condiciones
  de carrera. Responde `{ order, payment: { status: PENDING, amount, next } }`;
  el cargo real llega en la etapa Wompi.

## Pagos Wompi

Fuente: documentación oficial `docs.wompi.co` (Colombia). Sin endpoints,
parámetros, firmas ni estados inventados.

- Estructura `app/src/payments/`: `payments.module/controller/service/dto` +
  `providers/payment-provider.interface.ts` (abstracción `PaymentProvider`) +
  `providers/wompi.provider.ts` (implementación `WompiProvider`).
- Wompi Colombia: base sandbox `https://sandbox.wompi.co/v1`, prod
  `https://api.wompi.co/v1`; `GET /merchants/{public_key}` → acceptance tokens;
  firma de integridad `SHA256hex(reference + amount_in_cents + currency + secreto)`;
  `POST /transactions` (Bearer privada, `acceptance_token`, `amount_in_cents`,
  `currency: COP`, `customer_email`, `reference` única, `signature`,
  `payment_method`) → `201`, nace `PENDING`; verificación
  `GET /transactions/{id}`; estados finales `APPROVED|DECLINED|VOIDED|ERROR`.
- Tabla `payments` (`order_id`, `reference` única, `amount_cents`, `currency`,
  `status`, `wompi_transaction_id`, `customer_email`, `payment_method_type`,
  `raw_response`). Migración `0005_*`.
- El monto sale de `orders.total` (nunca de appweb). El frontend no decide el
  resultado: `GET /api/payments/:id/status` re-verifica contra Wompi; webhook
  `POST /api/payments/webhook` (evento `transaction.updated`) valida checksum
  SHA256 (`signature.properties` en orden + timestamp + `WOMPI_EVENTS_SECRET`,
  header `X-Event-Checksum`) y re-consulta a Wompi antes de aplicar.
- Efectos por estado (transacción, idempotente): `APPROVED` → pago `APPROVED`,
  pedido `paymentStatus APPROVED` + `CONFIRMED`; `DECLINED|VOIDED|ERROR` →
  pedido `DECLINED` + `CANCELLED` y restaura stock (`CANCELLATION`).
- Endpoints: `GET /api/payments/public-config` (llave pública + acceptance, sin
  secretos), `POST /api/payments/intent` (`{ orderId, customerEmail, paymentMethod? }`;
  sin método devuelve firma + acceptance para el Widget), `GET /api/payments/:id/status`,
  `GET /api/payments/by-order/:orderId`, `POST /api/payments/webhook`.
- Variables (`.env.example`, nunca en código): `WOMPI_ENV`, `WOMPI_PUBLIC_KEY`,
  `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`.
  Integración exclusivamente desde `app`; `appweb` solo usa la llave pública vía `app`.

## Imágenes

Ubicación: `appweb/public/images/` (servidas como `/images/...`, solo `next/image`,
cero dependencias externas en componentes).

- `brand/`: logo y marca.
- `home/`, `banners/`: piezas de portada.
- `categories/`: una imagen por categoría.
- `products/<categoria>/`: imágenes de producto.
- `testimonials/`: avatares o fotos de testimonios.

Formatos preferidos: `.webp` / `.png` / `.jpg`. Nombres en minúsculas con guiones.

Referencias de origen y rutas finales: `IMAGE_SOURCES.md` (raíz del proyecto).
Estado actual: placeholders `.svg` locales; nada descargado automáticamente.

## Desarrollo

- Nomenclatura fija: `app/`, `appweb/`. No renombrar.
- `app`: `npm run build` (tsc), `npm run start:dev`, `npm test` (jest e2e, 20 pruebas).
- `appweb`: `npm run typecheck`, `npm run build` (Next, 17 rutas), `npm run dev`.
- No se crean README separados por módulo salvo necesidad estricta. Este es el documento principal.

## Estado del proyecto

- [x] Base + Docker + estructura de carpetas + README principal.
- [x] `app` NestJS verificado (`GET /api/health`, ConfigModule, ValidationPipe, CORS). Módulos de dominio creados como carpetas vacías, sin implementar.
- [x] Drizzle ORM + conexión DB en `app` (Etapa 8: 5 tablas, migración aplicada y verificada).
- [x] Scaffolding `appweb` Next.js 14 + React 18 + TS.
- [x] Diseño `appweb` Etapa 6 (header, home completa, 8 rutas, mocks sin duplicados).
- [x] Sistema de imágenes Etapa 7 (`IMAGE_SOURCES.md`, placeholders locales, `next/image`).
- [x] Consumo de `app` desde `appweb` (Etapa 16: servicios + páginas conectadas).
- [x] Productos y categorías Etapa 9 (CRUD, búsqueda, filtros, paginación, orden, SKU/slug únicos).
- [x] Inventario Etapa 11 (movimientos, transacciones, stock nunca < 0, historial).
- [x] Carrito Etapa 12 (agregar/eliminar/cantidad/vaciar/consultar, stock y precio backend).
- [x] Pedidos Etapa 13 (snapshot, cálculo backend, transacciones, estados, cancelación restaura stock).
- [x] Checkout Etapa 14 (validación total backend, FOR UPDATE, payment pendiente).
- [x] Pagos Wompi Etapa 15 (provider abstraído, firma integridad, webhook verificado, sincroniza Payment/Order/Inventory).
- [x] Panel admin Etapa 17 (JWT + RolesGuard solo ADMIN; dashboard, productos, categorías, inventario, pedidos, clientes).
- [x] Docker completo Etapa 18 (db + app + appweb, healthchecks, volumen persistente).
- [x] Seguridad Etapa 19 (auditoría, rate limiting, JWT estricto, anti-suplantación).
- [x] Pruebas Etapa 20 (`npm test` en `app`: 20 e2e reales en 4 suites, ver abajo).

## Pruebas

```powershell
Set-Location app
npm test  # jest e2e: 4 suites, 20 pruebas
```

- Harness `app/test/test-app.ts`: PostgreSQL en memoria (`pg-mem`) con las
  **migraciones SQL reales** del proyecto, app Nest real por HTTP (supertest),
  `PAYMENT_PROVIDER` programable (no llama a Wompi).
- `auth.e2e-spec.ts`: registro, duplicado 409, login 401/201, `me` sin secretos,
  refresh + revocación en logout.
- `catalog.e2e-spec.ts`: permisos (401 invitado, 403 CUSTOMER, ADMIN ok), CRUD,
  409 duplicados, 400 validación, paginación, activar/desactivar.
- `orders.e2e-spec.ts`: carrito (precio backend, precio del cliente rechazado
  400, stock validado, cantidades, vaciar), checkout con matemática exacta
  (subtotal/descuento/envío/total), cupón inválido, `SALE` registrado, stock
  decrementado, transición inválida 400, cancelación restaura stock
  (`CANCELLATION`).
- `payments.e2e-spec.ts`: anti-suplantación de `userId`, intent con monto del
  pedido + firma SHA256 re-calculada, 403 en pedido ajeno, sync APPROVED →
  `CONFIRMED` (re-verificado en provider), webhook válido/ignorado/manipulado
  (400), DECLINED → `CANCELLED` + stock restaurado, rate limiting → 429.
- Correcciones derivadas: `@Public()` de clase en `AuthController` dejaba
  `me`/`logout` sin autenticar (500); ahora solo `register/login/refresh` son
  públicos. `@nestjs/mapped-types` degradado a `2.1.0` (CJS, acorde a Nest 10;
  v12 es ESM e incompatible).

## Funcionalidades terminadas

- Autenticación JWT con roles (registro, login, refresh, logout, `me`).
- Catálogo: productos y categorías (CRUD admin, lectura pública, filtros, paginación).
- Inventario con movimientos e historial, stock nunca negativo.
- Carrito completo con validación de stock y precio backend.
- Pedidos con snapshot, cálculo backend, estados y cancelación con restauración.
- Checkout transaccional con `FOR UPDATE`.
- Pagos Wompi (intent, firma de integridad, verificación, webhook validado).
- Panel administrativo (`/admin/*`, solo ADMIN).
- Conexión `appweb ↔ app` con estados loading/success/error/empty.
- Docker completo (`db` + `app` + `appweb`).
- Auditoría de seguridad aplicada.
- 20 pruebas e2e reales en verde.

## Funcionalidades pendientes

- Detalle `/productos/[slug]` y home con datos reales (hoy mocks visuales).
- Imágenes reales de producto (hoy placeholders `.svg`; ver `IMAGE_SOURCES.md`).
- Gestión de direcciones de usuario en cuenta.
- Widget Wompi embebido en `appweb` (hoy el intent se crea; falta UI de tarjeta/PSE).
- Emails transaccionales (confirmación, recibo).
- Seeds de catálogo y usuario ADMIN inicial.
- CI (lint + tests + build) y despliegue productivo (TLS, Redis para rate limit
  multi-instancia, `JWT_SECRET` real, llaves Wompi productivas).

## Flujo de compra

```
appweb: /productos → /carrito → /checkout (datos + dirección)
  → POST /api/checkout { cartId, shippingAddress }
  → backend valida usuario/dirección/productos/precios/stock,
    calcula subtotal/descuento/envío/total (FOR UPDATE)
  → crea Order PENDING + OrderItems snapshot + SALE + vacía carrito
  → POST /api/payments/intent { orderId, customerEmail, paymentMethod? }
  → firma SHA256 + transacción Wompi (PENDING)
  → webhook transaction.updated / GET :id/status re-verifica en Wompi
  → APPROVED: pedido CONFIRMED | DECLINED/VOIDED/ERROR: CANCELLED + stock restaurado
  → appweb: /mi-cuenta (pedidos)
```

## Flujo de inventario

```
Toda modificación pasa por InventoryService (transacción):
  increaseStock (PURCHASE/RETURN/ADJUSTMENT/CANCELLATION)
  decreaseStock (SALE/ADJUSTMENT, nunca stock < 0)
  adjustStock (fija valor absoluto)
Cada cambio inserta en inventory_movements
  (quantity con signo, previousStock, newStock, reason, reference).
Orígenes: checkout/pedidos (SALE), cancelaciones y pagos fallidos
  (CANCELLATION), panel admin (entradas/salidas/ajustes),
  ProductsService.update delega cambios de stock.
Historial: GET /api/inventory/movements (solo ADMIN).
```

## Flujo de pagos

```
1. appweb pide GET /payments/public-config (llave pública + acceptance).
2. POST /payments/intent: monto desde orders.total, referencia única,
   firma SHA256; sin paymentMethod devuelve datos para el Widget;
   con paymentMethod crea la transacción en Wompi (Bearer privada).
3. El frontend NUNCA decide: GET /payments/:id/status re-consulta Wompi.
4. Wompi notifica POST /payments/webhook (transaction.updated):
   checksum SHA256 validado + re-consulta a Wompi + aplicación idempotente.
5. Ver Flujo de compra para los efectos por estado.
```
