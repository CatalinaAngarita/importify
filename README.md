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
| Base de datos | MariaDB 11.4 (compatible MySQL) |
| ORM | Drizzle ORM |
| Infraestructura | Docker, Docker Compose |
| Pagos | Wompi (Colombia) |

## Arquitectura

```
appweb (Next.js) ──HTTP/REST──> app (NestJS) ──Drizzle──> MariaDB/MySQL
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
│   ├── drizzle/          # migración base MySQL + meta/_journal
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
| `MYSQL_ROOT_PASSWORD` | Contraseña root de MariaDB (solo local) |
| `MYSQL_USER` | Usuario de la base de datos |
| `MYSQL_PASSWORD` | Contraseña del usuario (solo local) |
| `MYSQL_DATABASE` | Nombre de la base de datos |
| `MYSQL_PORT` | Puerto publicado (3306) |
| `DATABASE_URL` | Conexión usada por Drizzle en `app` (compose inyecta host `db`) |
| `TEST_DATABASE_URL` | Base MySQL/MariaDB para las suites e2e (se vacía en cada ejecución) |
| `APP_PORT` | Puerto local de `app` (3001); en Hostinger se usa `PORT` |
| `APPWEB_PORT` | Puerto de `appweb` (3000) |
| `RUN_MIGRATIONS_ON_START` | `true` aplica migraciones al arrancar `app` (por defecto en producción) |
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

### MariaDB (servicio `db`)

```powershell
# Levantar
Copy-Item .env.example .env  # solo primera vez
docker compose up -d db

# Verificar estado y salud
docker compose ps
docker exec importify-db healthcheck.sh --connect --innodb_initialized

# Revisar logs
docker compose logs db --tail 50
docker compose logs -f db  # seguir en vivo

# Detener (conserva datos en volumen mariadbdata)
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
redondeadas, responsive. La vitrina toma productos y categorías de la API/DB;
`services/catalog.mock.ts` solo aporta metadatos visuales (emoji, rating, vendidos)
y sirve de respaldo de imágenes. `services/catalog.service.ts` centraliza el mapeo
API → UI y la resolución de imágenes.

- Header global: logo, buscador (→ `/productos?q=`), carrito con contador,
  Inicio, Productos, Quiénes somos (`/#nosotros`), Contacto (`/#contacto`), login.
- Home `/`: hero, categorías, beneficios, destacados y más vendidos desde API,
  quiénes somos, testimonios.
- Rutas: `/productos` (filtro por categoría + búsqueda, 50 productos API),
  `/productos/[slug]` (detalle + relacionados API), `/carrito` (carrito API/DB),
  `/login`, `/registro`, `/checkout` (checkout API), `/mi-cuenta` (pedidos API).
- Componentes reutilizables en `components/`: `Container`, `Header`, `Footer`,
  `SectionTitle`, `CategoryCard`, `ProductCard`, `BenefitCard`, `TestimonialCard`,
  `ApiState` (loading/error/empty).

## `appweb` conectada a `app`

- Servicios en `appweb/services/`: `api.ts` (cliente central, token en
  localStorage, `ApiError`), `auth.service.ts` (register/login/me), `products`,
  `categories`, `cart` (carrito persistido en API/DB), `orders`,
  `checkout`, `payments`, `catalog.service.ts` (API → UI). Tipos en
  `types/api.ts`. Base única `NEXT_PUBLIC_API_URL` (ver `appweb/.env.example`);
  ningún componente repite URLs.
- Hook `hooks/useApi.ts`: estados `idle|loading|success|error|empty` + `reload`.
- Páginas conectadas: `/productos` (API/DB), `/productos/[slug]` (API/DB),
  `/carrito` (API/DB; totales alineados con backend), `/checkout` (checkout →
  intent de pago Wompi → `/mi-cuenta`), `/mi-cuenta` (pedidos API, requiere
  login), `/login` y `/registro` (token real). `next.config.mjs` reescribe
  `/uploads/*` hacia la API para imágenes subidas desde admin.
- Panel `/admin` (Etapa 17, solo ADMIN vía `AdminGuard` + `GET /auth/me`):
  `dashboard` (ventas aprobadas, pedidos por estado, stock bajo, agotados),
  `products` (crear/editar con categoría, stock, precio anterior, destacado,
  más vendido y activo), `categories` (crear, activar/desactivar),
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
| `db` | `mariadb:11.4` | 3306 | `healthcheck.sh` | — |
| `app` | `app/Dockerfile` (Node 20, build TS, migra + inicia) | 3001 | `GET /api/health` | `db` saludable |
| `appweb` | `appweb/Dockerfile` (Node 20, build Next) | 3000 | `GET /` | `app` saludable |

- `app` usa `DATABASE_URL` con host `db` (inyectado por compose, no localhost);
  al arrancar ejecuta `node migrate.cjs` (migraciones vía `drizzle-orm`,
  dependencia de producción) y luego `node dist/main.js`.
- `appweb` recibe `NEXT_PUBLIC_API_URL` como build-arg y variable (navegador →
  `http://localhost:3001/api`).
- Volumen `mariadbdata` persistente: `docker compose down` NO borra datos (solo
  `down -v` los elimina).

```powershell
Copy-Item .env.example .env  # solo primera vez
docker compose up -d --build # levanta db + app + appweb (modo producción)
docker compose ps            # estado y salud
docker compose logs -f app   # logs (db | appweb)
docker compose down          # detiene y conserva datos (mariadbdata intacto)
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

- MariaDB 11.4 en servicio `db` (puerto 3306, volumen persistente `mariadbdata`).
- `app` es la única con acceso directo.
- Esquemas en `app/src/database/schema/`: `users.ts` (roles, users),
  `catalog.ts` (categories, products, productImages), `inventory.ts`
  (inventoryMovements), `cart.ts` (carts, cartItems), `order.ts` (orders,
  orderItems), `payment.ts` (payments). UUID PK `char(36)` generado en la app
  (`randomUUID()`), FKs con `ON DELETE CASCADE` / `SET NULL` según dominio,
  uniques, índices, `created_at/updated_at` con `CURRENT_TIMESTAMP`.
  `json` se usa para direcciones y respuestas crudas de Wompi.

### Conexión en DBeaver (desarrollo local)

Proyecto levantado con: `docker compose up -d db` (contenedor `importify-db`, healthy).

| Campo | Valor |
| ----- | ----- |
| Tipo | MariaDB / MySQL |
| Nombre | `importify-local` |
| Host | `localhost` |
| Puerto | `3306` |
| Base de datos | `importify` |
| Usuario | `importify` |
| Contraseña | `importify` (solo local, ver `.env`) |
| URL JDBC | `jdbc:mysql://localhost:3306/importify` |

Pasos: DBeaver → Nueva conexión → MySQL → ingresar datos → Test Connection → Finalizar.
Archivo de referencia para importar: `database/dbeaver-importify-local.json`.

## Migraciones

Viven en `app/drizzle/` (1 migración base + `meta/_journal.json`).

| Migración | Contenido |
| --------- | --------- |
| `0000_special_lilandra` | todas las tablas, enums, FKs e índices del dominio |

La carpeta `app/drizzle-postgres-backup/` conserva las migraciones históricas de
PostgreSQL (solo referencia; no se aplican). La base MySQL/MariaDB se crea desde
cero con la migración `0000_special_lilandra`.

```powershell
Set-Location app
$env:DATABASE_URL="mysql://importify:importify@localhost:3306/importify"
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
| Pedidos | `GET /api/orders`, `/:id` (JWT; cliente solo los propios, ADMIN todos), `POST` (público), `PATCH :id/status` (solo ADMIN) |
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
  índices por producto, tipo y fecha. Incluida en la migración base `0000_*`.
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
  único por `(cart_id, product_id)`). Incluida en la migración base `0000_*`.
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
  `productName`, `sku`, `unitPrice`, `quantity`, `subtotal`). Incluida en la
  migración base `0000_*`.
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
  `raw_response`). Incluida en la migración base `0000_*`.
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

## Despliegue en Hostinger

Hostinger Web/Cloud usa **MariaDB** (compatible MySQL) y soporta Node.js 20/22.
Se despliegan dos Web Apps independientes (`app` y `appweb`) y una base MySQL
administrada. En un VPS también se puede usar Docker Compose.

### 1. Base de datos

1. En hPanel: `Websites → Dashboard → Databases → MySQL Databases → Create`.
2. Guardar el nombre completo de la base y el usuario (incluyen prefijo, p. ej.
   `u123456789_importify`) y la contraseña.
3. Usar host `127.0.0.1` y puerto `3306` (no `localhost`; Node resuelve
   `localhost` como IPv6 `::1` y Hostinger solo autoriza `127.0.0.1`).
4. Cadena resultante:

   ```env
   DATABASE_URL=mysql://USUARIO:PASSWORD@127.0.0.1:3306/BASE
   ```

### 2. App NestJS (`app`)

Crear un Web App desde GitHub/GitLab o subiendo un ZIP del proyecto:

| Ajuste | Valor |
| ------ | ----- |
| Root directory | `app` |
| Application type | NestJS |
| Node.js | 20 o 22 |
| Build script | `build` |
| Output directory | `dist` |
| Entry file | `main.js` |

Variables de entorno mínimas:

```env
DATABASE_URL=mysql://USUARIO:PASSWORD@127.0.0.1:3306/BASE
NODE_ENV=production
RUN_MIGRATIONS_ON_START=true
JWT_SECRET=<secreto-largo-y-aleatorio>
CORS_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
WOMPI_ENV=production
WOMPI_PUBLIC_KEY=...
WOMPI_PRIVATE_KEY=...
WOMPI_INTEGRITY_SECRET=...
WOMPI_EVENTS_SECRET=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

No hace falta fijar `PORT`: la app usa `process.env.PORT` y Hostinger lo inyecta.
El `postbuild` copia `drizzle/` a `dist/drizzle/`, y al arrancar se aplican las
migraciones automáticamente (`RUN_MIGRATIONS_ON_START=true` o `NODE_ENV=production`).
La migración base crea las 11 tablas. Si se prefiere migrar por SSH, poner
`RUN_MIGRATIONS_ON_START=false` y ejecutar `node migrate.cjs` una vez.

### 3. Appweb Next.js (`appweb`)

| Ajuste | Valor |
| ------ | ----- |
| Root directory | `appweb` |
| Application type | Next.js |
| Node.js | 20 o 22 |
| Build script | `build` |
| Output directory | `.next` |
| Entry file | (vacío) |

`NEXT_PUBLIC_API_URL` se incrusta en el build; debe apuntar a la API pública y
requiere redeploy al cambiarla:

```env
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api
```

Hostinger aplica `output: "standalone"` automáticamente. Las imágenes de
`appweb/public/images/` se publican con la app; no están en la base.

### 4. Migrar los datos locales

Exportar desde el MariaDB local (genera `database/importify-data.sql`, ignorado
por git):

```powershell
.\database\export-local-data.ps1
```

Importar en Hostinger con phpMyAdmin (subir el `.sql`) o por MySQL remoto:

1. hPanel → `Databases → Remote MySQL`: autorizar la IP local y copiar el host
   `srvXXXX.hstgr.io` (puerto 3306).
2. Desde `app`:

   ```powershell
   $env:DATABASE_URL="mysql://USUARIO:PASSWORD@srvXXXX.hstgr.io:3306/BASE"
   node scripts/import-data.cjs
   node scripts/verify-deploy.cjs
   ```

El schema debe existir antes de importar: arrancar `app` una vez para que corran
las migraciones, o ejecutar `node migrate.cjs` por SSH. El dump no incluye
`__drizzle_migrations` y no crea tablas; importar sobre una base vacía.

Datos esperados: 3 roles, 3 usuarios, 4 categorías, 50 productos y 50 imágenes.
Las 50 rutas de `product_images.processed_image` deben existir en
`appweb/public/images/` con el mismo nombre, mayúsculas y acentos. El script
`app/scripts/sync-catalog-metadata.cjs` normaliza rutas, inserta imágenes
faltantes, acentúa categorías y marca destacados/más vendidos; usar
`--dry-run` y `--verify` antes/después.

### 5. Verificación y rollback

```powershell
# Desde app, con la URL pública
node scripts/smoke-test.cjs https://api.tu-dominio.com

# Login admin opcional
$env:SMOKE_ADMIN_EMAIL="admin@importify.com"
$env:SMOKE_ADMIN_PASSWORD="..."
node scripts/smoke-test.cjs https://api.tu-dominio.com
```

Verificar `/api/health`, catálogo, categorías, login admin y una imagen real.
Configurar en Wompi la URL de eventos `https://api.tu-dominio.com/api/payments/webhook`
con el mismo `WOMPI_EVENTS_SECRET`, y SMTP para los códigos OTP del panel.
Antes de cada despliegue: exportar la base desde hPanel y conservar el commit
anterior. Rollback: redeploy del commit previo y, si hubo cambios de schema,
restaurar el backup SQL.

### Límites del hosting compartido

- `app/uploads/` no es persistente; para nuevas subidas usar object storage.
- `rembg`/Python puede no estar disponible; las imágenes actuales ya están
  procesadas en `appweb/public/images/`.
- Los procesos Node se detienen sin tráfico y arrancan en la siguiente petición.

## Imágenes

Ubicación: `appweb/public/images/` (servidas como `/images/...`, solo `next/image`,
cero dependencias externas en componentes).

- `brand/`: logo y marca.
- `home/`, `banners/`: piezas de portada.
- `categories/`: una imagen por categoría.
- `products/<categoria>/`: imágenes de producto.
- `testimonials/`: avatares o fotos de testimonios.

Formatos preferidos: `.webp` / `.png` / `.jpg`. Nombres en minúsculas con guiones.
La base guarda solo la ruta (`/images/products/...`); los archivos se despliegan
con `appweb`. Referencias de origen: `IMAGE_SOURCES.md` (raíz del proyecto).

## Desarrollo

- Nomenclatura fija: `app/`, `appweb/`. No renombrar.
- `app`: `npm run build` (tsc), `npm run start:dev`, `npm test` (jest e2e, 20 pruebas).
- `appweb`: `npm run typecheck`, `npm run build` (Next, 17 rutas), `npm run dev`.
- No se crean README separados por módulo salvo necesidad estricta. Este es el documento principal.

## Estado del proyecto

- [x] Base + Docker + estructura de carpetas + README principal.
- [x] `app` NestJS verificado (`GET /api/health`, ConfigModule, ValidationPipe, CORS). Módulos de dominio creados como carpetas vacías, sin implementar.
- [x] Drizzle ORM + conexión DB en `app` (MySQL/MariaDB, 11 tablas, migración base aplicada y verificada).
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

- Harness `app/test/test-app.ts`: MySQL/MariaDB real (`TEST_DATABASE_URL`) con las
  **migraciones SQL reales** del proyecto, app Nest real por HTTP (supertest),
  `PAYMENT_PROVIDER` programable (no llama a Wompi). Cada suite vacía las tablas.
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
- Vitrina, home, detalle, carrito y admin de productos desde API/DB.
- 50 productos con 50 imágenes normalizadas; 6 destacados y 8 más vendidos.
- `GET /orders` y `GET /orders/:id` protegidos por JWT y ownership.
- Docker completo (`db` + `app` + `appweb`).
- Auditoría de seguridad aplicada.
- 20 pruebas e2e reales en verde.

## Funcionalidades pendientes

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
