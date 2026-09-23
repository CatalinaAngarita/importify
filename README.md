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
- Docker Compose orquesta la base de datos en local. Las imágenes de `app` y `appweb` se agregarán en sus etapas.

## Estructura del proyecto

```
importify/
├── app/
│   ├── src/        # Código NestJS (etapa siguiente)
│   └── drizzle/    # Schemas y migraciones Drizzle
├── appweb/
│   ├── app/        # Rutas App Router Next.js (etapa siguiente)
│   ├── components/
│   ├── services/   # Clientes HTTP hacia app
│   ├── hooks/
│   ├── types/
│   └── public/
│       └── images/
│           ├── brand/
│           ├── home/
│           ├── banners/
│           ├── categories/
│           ├── products/
│           │   ├── technology/
│           │   ├── automotive/
│           │   ├── accessories/
│           │   └── personal-care/
│           └── testimonials/
├── database/       # Scripts SQL / seeds (si se requieren)
├── docker-compose.yml
├── .env.example
└── README.md
```

No se crean README separados por módulo salvo necesidad estricta. Este es el documento principal.

## Instalación

Requisitos: Node.js 20+, Docker + Docker Compose, Git.

```powershell
git clone <url> importify
Set-Location importify
Copy-Item .env.example .env
docker compose up -d db
```

El scaffolding de `app/` y `appweb/` (package.json, instalación de dependencias) se documentará en sus etapas.

## Variables de entorno

Ver `.env.example`. Nunca commitear `.env` ni secretos reales.

| Variable | Uso |
| -------- | --- |
| `POSTGRES_USER` | Usuario PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña PostgreSQL (solo local) |
| `POSTGRES_DB` | Nombre de la base de datos |
| `POSTGRES_PORT` | Puerto publicado (5432) |
| `DATABASE_URL` | Conexión usada por Drizzle en `app` |
| `APP_PORT` | Puerto de `app` (3001) |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma |

Variables futuras (no usar valores reales aquí): `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET`, `JWT_SECRET`.

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
# appweb
Set-Location appweb
Copy-Item .env.example .env  # solo primera vez (NEXT_PUBLIC_API_URL)
npm install
npm run typecheck
npm run build
npm run dev  # http://localhost:3000
```

## Docker

- `db`: `postgres:16-alpine`, volumen `pgdata`, healthcheck con `pg_isready`.
- Validar composición: `docker compose config`.

Los `Dockerfile` de `app` y `appweb` se agregarán en sus etapas.

## Base de datos

- PostgreSQL 16 en servicio `db` (puerto 5432).
- `app` es la única con acceso directo.
- Migraciones y seeds viven en `app/drizzle/` (y `database/` solo si se requiere SQL manual).

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

## Drizzle ORM

- ORM oficial del proyecto en `app`.
- Schemas y migraciones en `app/drizzle/`.
- Comandos típicos (cuando exista `app/`):

```powershell
Set-Location app
npm run drizzle:generate
npm run drizzle:migrate
npm run drizzle:studio
```

## API

Base: `http://localhost:3001/api` (prefijo global `api`).

- `GET /api/health` → `{ "status": "ok", "service": "importify-app", "timestamp": "..." }`.
- Resto de endpoints por definir en etapas de dominio.

## Autenticación

Pendiente de etapa. Alcance previsto: registro/login, JWT, roles (admin/cliente).

## Productos

Pendiente de etapa. Catálogo con nombre, descripción, precio, imágenes por categoría (`technology`, `automotive`, `accessories`, `personal-care`).

## Categorías

Pendiente de etapa. Taxonomía base alineada a `public/images/categories/`.

## Inventario

Pendiente de etapa. Control de stock ligado a pedidos.

## Carrito

Pendiente de etapa. Carrito en `appweb` con persistencia local + validación de stock en `app`.

## Pedidos

Pendiente de etapa. Estados: creado → pagado → enviado → entregado / cancelado.

## Checkout

Pendiente de etapa. Flujo: carrito → datos → pedido → pago Wompi → confirmación.

## Pagos

Wompi (Colombia). Integración exclusivamente desde `app`. `appweb` solo usa la llave pública vía `app`. Nunca exponer llaves privadas en `appweb` ni en este README.

## Imágenes

Convención en `appweb/public/images/`:

- `brand/`: logo y marca.
- `home/`, `banners/`: piezas de portada.
- `categories/`: una imagen por categoría.
- `products/<categoria>/`: imágenes de producto.
- `testimonials/`: avatares o fotos de testimonios.

Formatos preferidos: `.webp` / `.png` / `.jpg`. Nombres en minúsculas con guiones.

## Desarrollo

- Trabajo por etapas. No avanzar sin instrucción.
- Cada etapa: analizar, crear/modificar solo lo necesario, código limpio, verificar sin errores, actualizar este README, resumir, listar archivos y comandos, detenerse.
- Nomenclatura fija: `app/`, `appweb/`. No renombrar.

## Estado del proyecto

- [x] Base + Docker + estructura de carpetas + README principal.
- [x] `app` NestJS verificado (`GET /api/health`, ConfigModule, ValidationPipe, CORS). Módulos de dominio creados como carpetas vacías, sin implementar.
- [ ] Drizzle ORM + conexión DB en `app`.
- [x] Scaffolding `appweb` Next.js 14 + React 18 + TS (home funcional con mocks, sin API real).
- [ ] Consumo de `app` desde `appweb` (`services/api.ts` listo, sin uso).
- [ ] Dominio: auth, productos, categorías, inventario, carrito, pedidos, checkout, Wompi.
