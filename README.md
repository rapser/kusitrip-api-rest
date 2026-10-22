# kusitrip-api-rest

API REST para el app iOS **KusiTrip** — NestJS + Prisma + PostgreSQL hospedado en [Supabase](https://supabase.com), desplegada en [Render](https://render.com).

El catálogo (destinos, actividades, fotos y opiniones) proviene de [civitatis.com/es](https://www.civitatis.com/es/), centrado en **Perú y Sudamérica**: Cusco, Lima, Arequipa, Puno, Buenos Aires, Río de Janeiro, Cartagena de Indias y Santiago de Chile.

## Stack

- [NestJS](https://nestjs.com) 11 (TypeScript)
- [Prisma](https://www.prisma.io) 6 ORM
- PostgreSQL en Supabase (Supavisor como pooler de conexiones)
- Autenticación JWT (access token de 15 min + refresh token rotado de 30 días); contraseñas con `bcrypt`, refresh tokens guardados como hash SHA-256
- `@nestjs/swagger` para documentación interactiva
- Helmet, CORS, rate limiting (`@nestjs/throttler`), validación con `class-validator`

## Instalación

> 📘 **Guía paso a paso para levantarlo en tu Mac:** [`docs/LEVANTAR-EN-LOCAL.md`](docs/LEVANTAR-EN-LOCAL.md). Explica cómo correrlo contra Supabase o contra una base local, la salida esperada de cada comando y cómo resolver los errores comunes.

Resumen (ejecutar **dentro de la carpeta del proyecto**):

```bash
npm install
cp .env.example .env      # completa DATABASE_URL / DIRECT_URL / JWT secrets — ver abajo
npx prisma migrate deploy # crea las tablas en Supabase
npx prisma db seed        # carga el catálogo de Civitatis + usuarios demo
npm run start:dev
```

> npm 11 bloquea los *install scripts* de las dependencias por defecto. Los que hacen falta (`bcrypt`, `prisma`, `@prisma/client`, `@prisma/engines`) ya están aprobados en `allowScripts` dentro de `package.json`.

## Base de datos local (sin Supabase)

Para desarrollar sin conexión, o antes de tener el proyecto de Supabase, el repo trae una base PostgreSQL local con [PGlite](https://pglite.dev) (Postgres compilado a WebAssembly). Corre con Node: no hace falta instalar Postgres, Docker ni Homebrew. Es solo para desarrollo; en producción se usa Supabase.

### 1. Apuntar el `.env` a la base local

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/postgres?sslmode=disable&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:55432/postgres?sslmode=disable&connection_limit=1"
```

(`JWT_SECRET` y `JWT_REFRESH_SECRET` se completan igual que con Supabase.)

### 2. Encender la base

En una terminal aparte (queda ocupada mientras la base esté encendida):

```bash
npm run db:local
```

Está lista cuando aparece `PGLiteSocketServer listening on {"port":55432,...}`. Los datos se guardan en la carpeta `.pglite/` (ignorada por git), así que **se conservan al apagarla y volver a encenderla**.

### 3. Primera vez: crear tablas y cargar datos

Con la base encendida, en otra terminal:

```bash
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Las siguientes veces basta con `npm run db:local` y `npm run start:dev`.

### 4. Apagar la base

1. Detén primero el API (`Ctrl+C` en la terminal de `npm run start:dev`).
2. Luego la base: `Ctrl+C` en la terminal de `npm run db:local`.

Si la lanzaste en segundo plano o se te cerró la terminal:

```bash
lsof -i :55432 -sTCP:LISTEN -P     # ver qué proceso la tiene
pkill -INT -f "pglite-server"      # apagarla
```

### Reiniciar desde cero

Con la base apagada, borra la carpeta y repite el paso 3:

```bash
rm -rf .pglite
```

### Si la base se queda colgada

PGlite atiende las conexiones de una en una. Si cortas un `migrate` o un `seed` a medias (por ejemplo con `Ctrl+C`), la base puede quedarse esperando y los comandos siguientes no terminan. Solución: apaga la base (`Ctrl+C`), vuelve a encenderla y repite el comando.

### Alternativa: PostgreSQL de Homebrew

Si prefieres un Postgres nativo: `brew install postgresql@16 && brew services start postgresql@16` para encenderlo y `brew services stop postgresql@16` para apagarlo. Crea la base con `createdb kusitrip` y usa `postgresql://<tu-usuario>@localhost:5432/kusitrip` en ambas variables (sin `pgbouncer=true`).

### Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string del **Transaction pooler** de Supabase (puerto `6543`) con `?pgbouncer=true&connection_limit=1`. La usa la app en tiempo de ejecución |
| `DIRECT_URL` | Connection string del **Session pooler** (puerto `5432`). La usa Prisma Migrate |
| `JWT_SECRET` | Firma los access tokens. Generar con `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Firma los refresh tokens. Generar igual, con otro valor |
| `PORT` | Por defecto `3000` |

## Configuración de Supabase (paso a paso)

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) e inicia sesión.
2. **New project** → nombre `kusitrip`, define una **Database Password** (guárdala, va dentro de los connection strings) y elige la región más cercana a Render (por ejemplo **East US (North Virginia)** si el servicio de Render está en Virginia, u **Oregon** si está en Oregon).
3. Cuando el proyecto termine de crearse, pulsa el botón **Connect** (arriba) → pestaña **ORMs** → **Prisma**. Supabase te muestra dos líneas listas para pegar:
   - `DATABASE_URL` → host `*.pooler.supabase.com`, puerto **6543** (*Transaction pooler*), ya incluye `?pgbouncer=true`. Agrégale `&connection_limit=1`.
   - `DIRECT_URL` → mismo host, puerto **5432** (*Session pooler*).
   - Reemplaza `[YOUR-PASSWORD]` por la contraseña del paso 2.
   - No uses la *Direct connection* (`db.<ref>.supabase.co`) en `DIRECT_URL`: solo funciona por IPv6 y Render no tiene salida IPv6.
4. Pega ambos valores en tu `.env`.
5. `npx prisma migrate deploy` — crea las tablas. La migración inicial también activa **Row Level Security** en todas las tablas: Supabase expone el esquema `public` por su Data API (PostgREST) y sin RLS cualquiera con la `anon key` podría leer `users`. Prisma se conecta como `postgres`, que ignora RLS, así que el API no se ve afectado.
6. `npx prisma db seed` — carga 8 categorías, 8 destinos, 31 actividades, 156 opiniones y 2 usuarios demo. Es idempotente (hace upsert), se puede volver a correr.
7. Verifica en Supabase → **Table Editor** que estén las tablas `users`, `refresh_tokens`, `categories`, `destinations`, `activities`, `reviews`, `favorites`, `bookings` y `_prisma_migrations`.

Usuarios demo:

| Email | Contraseña |
|---|---|
| `usuario@kusitrip.com` | `kusitrip123` |
| `ana@kusitrip.com` | `ana12345` |

## Despliegue a Render (paso a paso)

1. Sube el código a la rama `main` de `https://github.com/rapser/kusitrip-api-rest`.
2. Entra al [dashboard de Render](https://dashboard.render.com) → **New** → **Web Service** (no "Static Site").
3. Conecta GitHub y selecciona el repo `kusitrip-api-rest`.
4. Configuración:
   - **Branch:** `main`
   - **Root Directory:** vacío
   - **Runtime:** Node
   - **Build Command:** `npm install --include=dev && npm run build`
     - El `--include=dev` es obligatorio. Con `NODE_ENV=production`, `npm install` omite las devDependencies, y el build necesita `@nestjs/cli` (el comando `nest`) y TypeScript. Sin él, el build falla con `sh: 1: nest: not found`.
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free
5. **Environment Variables:**
   - `DATABASE_URL` → Transaction pooler de Supabase (6543, con `pgbouncer=true&connection_limit=1`)
   - `DIRECT_URL` → Session pooler de Supabase (5432)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` → `openssl rand -hex 32`
   - `NODE_ENV` = `production`
   - (`PORT` no se agrega: Render la inyecta y `src/main.ts` la respeta)
6. **Health Check Path:** `/health`.
7. **Deploy Web Service**.
8. Render asigna una URL pública (tipo `https://kusitrip-api-xxxx.onrender.com`). Esa es la `API_BASE_URL` de producción del app iOS.

Alternativa: el repo incluye `render.yaml`, así que también se puede crear con **New → Blueprint**. Render pedirá `DATABASE_URL` y `DIRECT_URL` y generará los secretos JWT solo.

> `"postinstall": "prisma generate"` en `package.json` es obligatorio: sin él Render instala dependencias pero no genera el cliente de Prisma y la app falla al arrancar.

### Limitaciones del plan Free de Render

- **Spin down por inactividad:** tras ~15 min sin tráfico la instancia se apaga y la siguiente request tarda 30-60 s. Por eso el app iOS usa un timeout de 90 s.
- **Sin one-off jobs:** las migraciones nuevas se aplican desde tu máquina con `npx prisma migrate deploy` apuntando a Supabase.
- **Supabase Free** pausa el proyecto tras 7 días sin actividad; se reactiva desde el dashboard.

## Corriendo en desarrollo

```bash
npm run start:dev
```

- Swagger UI: `http://localhost:3000/docs`
- Spec: `http://localhost:3000/docs-json` (también exportada en [`openapi.json`](openapi.json))
- Health check: `http://localhost:3000/health`

## Endpoints

🔓 público · 🔒 requiere `Authorization: Bearer <accessToken>`

| Método | Ruta | | Descripción |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | Crear cuenta (`name`, `surname`, `email`, `password`) |
| POST | `/auth/login` | 🔓 | Iniciar sesión |
| POST | `/auth/refresh` | 🔓 | Rotar el par de tokens |
| POST | `/auth/logout` | 🔒 | Revocar el refresh token |
| GET | `/auth/me` | 🔒 | Perfil del usuario |
| GET | `/home` | 🔓 | Categorías + destinos + actividades destacadas (una sola llamada) |
| GET | `/categories` | 🔓 | Categorías |
| GET | `/destinations?country=&q=` | 🔓 | Destinos |
| GET | `/destinations/:id` | 🔓 | Detalle de destino |
| GET | `/destinations/:id/activities?category=` | 🔓 | Actividades de un destino |
| GET | `/activities?destinationId=&category=&featured=&q=&page=&limit=` | 🔓 | Actividades paginadas (`{ items, meta }`) |
| GET | `/activities/:id` | 🔓 | Detalle de actividad |
| GET | `/activities/:id/related` | 🔓 | Otras actividades del mismo destino |
| GET | `/activities/:id/reviews` | 🔓 | Opiniones |
| POST | `/activities/:id/reviews` | 🔒 | Escribir una opinión (actualiza rating y número de opiniones) |
| GET | `/search?q=` | 🔓 | Buscar actividades y destinos (mínimo 2 caracteres) |
| GET | `/favorites` | 🔒 | Lista de deseos |
| POST | `/favorites` | 🔒 | Agregar (`activityId`) |
| DELETE | `/favorites/:activityId` | 🔒 | Quitar |
| POST | `/bookings` | 🔒 | Reservar (`activityId`, `date`, `numberOfPeople`); el precio se toma del catálogo |
| GET | `/bookings` | 🔒 | Mis reservas |
| GET | `/bookings/:id` | 🔒 | Detalle de reserva |
| PATCH | `/bookings/:id/cancel` | 🔒 | Cancelar reserva |
| GET | `/health` | 🔓 | Liveness + conexión a la base |

Los precios están en **USD**, igual que en Civitatis (`currency` viene en cada actividad y reserva).

## Estándar de errores

Las respuestas exitosas devuelven el recurso directamente. Los errores siempre tienen esta forma:

```json
{ "error": { "code": "ACTIVITY_NOT_FOUND", "message": "Actividad no encontrada.", "type": "not_found_error", "requestId": "req_..." } }
```

`message` está localizado (`es` por defecto, `en` con `Accept-Language: en`). Los errores de validación incluyen `details: [{ field, code, message }]`.

## Arquitectura

**Monolito modular**: un solo proceso Node, separado en módulos de Nest por dominio (`auth`, `home`, `categories`, `destinations`, `activities`, `reviews`, `search`, `favorites`, `bookings`, `health`). Cada módulo sigue la misma estructura:

```
Controller   (HTTP, DTOs validados, Swagger)
    ↓
Service      (reglas de negocio; depende de abstracciones)
    ↓
Repository   (clase abstracta = puerto)  ←  PrismaXRepository (adaptador)
    ↓
PrismaService → Supabase Postgres
```

Cómo se aplica SOLID:

- **S** — Controller solo traduce HTTP, Service solo tiene reglas, Repository solo persiste; los mappers (`*.mapper.ts`) convierten entidades a DTOs de respuesta.
- **O / L** — Cada repositorio es una clase abstracta; cambiar de Prisma a otra fuente (cache, otro ORM, un mock en tests) es agregar una subclase y cambiar `useClass` en el módulo.
- **I** — Repositorios pequeños por agregado (`UsersRepository`, `RefreshTokensRepository`, `BookingsRepository`, …) en vez de un DAO genérico.
- **D** — Los services reciben `UsersRepository`, `PasswordHasher`, etc. por inyección; nunca importan `PrismaService`. Los tests unitarios (`*.spec.ts`) lo demuestran con repositorios en memoria.

Piezas transversales registradas globalmente en `app.module.ts`: `RequestIdMiddleware`, `HttpExceptionFilter` (envelope de errores), `LoggingInterceptor`, `ThrottlerGuard` (100 req/min por IP) y `JwtAuthGuard` (global, con `@Public()` para las rutas abiertas).

## Estructura

```
src/
  auth/           # register/login/refresh/logout/me, JWT, repositorios y hasher
  home/           # endpoint agregado para la pantalla Home
  categories/
  destinations/
  activities/
  reviews/
  search/
  favorites/      # lista de deseos
  bookings/       # reservas
  health/
  common/         # errores, i18n, guards, interceptors, middleware, transformers
  prisma/         # PrismaService/PrismaModule
prisma/
  schema.prisma
  migrations/
  seed.ts
  data/           # catálogo en JSON (categories, destinations, activities, reviews)
```

## Datos del catálogo

`prisma/data/*.json` se generó a partir de las páginas públicas de civitatis.com/es (precio, valoración, número de opiniones y viajeros, duración, idioma, qué incluye, punto de encuentro, galería de fotos y opiniones recientes de cada actividad). Las fotos apuntan al CDN de Civitatis (`f.civitatis.com`). Para un uso comercial habría que copiarlas a Supabase Storage y revisar los términos de Civitatis.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Corre en local con hot reload |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Corre el build compilado |
| `npm run db:local` | Enciende la base PostgreSQL local (PGlite) en el puerto 55432 |
| `npm run lint` | ESLint (`--fix`) |
| `npm test` | Tests unitarios |
| `npm run test:e2e` | Levanta la app y prueba `/health` (necesita `.env`) |
| `npm run docs:export` | Regenera `openapi.json` |
| `npx prisma studio` | Navegar la base de datos |
| `npx prisma migrate dev --name <nombre>` | Crear y aplicar una migración nueva |
| `npx prisma migrate deploy` | Aplicar migraciones pendientes |
| `npx prisma db seed` | Volver a cargar el catálogo (idempotente) |
