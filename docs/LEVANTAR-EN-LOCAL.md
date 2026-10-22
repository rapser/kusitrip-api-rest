# Levantar el API en local

Guía para correr `kusitrip-api-rest` en tu Mac. Hay dos formas:

| Opción | Base de datos | Cuándo usarla |
|---|---|---|
| **A. Contra Supabase** | La base real en la nube | Lo normal. Ves los mismos datos que la app en producción |
| **B. Base local (PGlite)** | Una base en tu Mac, carpeta `.pglite/` | Sin internet, sin cuenta de Supabase, o para probar sin tocar datos reales |

> **Importante:** todos los comandos de esta guía se ejecutan **dentro de la carpeta del proyecto**. El prompt de la Terminal debe terminar en `kusitrip-api-rest %`. Ver [Errores comunes](#errores-comunes).

---

## Requisitos (solo la primera vez)

- **Node.js 24** (`node -v` debe mostrar `v24.x`). El repo trae `.nvmrc`.
- El repo clonado y las dependencias instaladas:

```bash
cd ~/Downloads/Codigo
git clone https://github.com/rapser/kusitrip-api-rest.git   # si aún no lo tienes
cd kusitrip-api-rest
npm install
```

`npm install` también genera el cliente de Prisma (script `postinstall`).

---

## Opción A — Contra Supabase

### 1. Crear el `.env` (solo la primera vez)

```bash
cp .env.example .env
open -e .env
```

En Supabase: **Connect** (botón arriba del proyecto) → **ORMs** → **Prisma** → pestaña **`.env.local`**. Copia las dos líneas, pero **pégalas en `.env`, no en `.env.local`**: NestJS y Prisma solo leen `.env`.

El `.env` debe quedar así (con tu contraseña en lugar de `TU-CONTRASEÑA`, **en las dos líneas**):

```env
DATABASE_URL="postgresql://postgres.<ref>:TU-CONTRASEÑA@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:TU-CONTRASEÑA@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

JWT_SECRET="..."
JWT_REFRESH_SECRET="..."

PORT=3000
NODE_ENV=development
```

- La contraseña va **entre `:` y `@`**, sin corchetes.
- A `DATABASE_URL` (puerto **6543**) hay que **agregarle `&connection_limit=1`** al final. Supabase no lo incluye.
- `JWT_SECRET` y `JWT_REFRESH_SECRET`: genera cada uno con `openssl rand -hex 32` (dos valores distintos).
- Si la contraseña tiene `@ : / ? # %`, rompe la URL. Es más fácil generar una nueva en Supabase → **Project Settings → Database → Reset database password**.

El `.env` está en `.gitignore`: **nunca se sube a GitHub**. No lo compartas.

### 2. Crear las tablas y cargar los datos (solo la primera vez)

Ejecuta los comandos **de uno en uno**:

```bash
npx prisma migrate deploy
```

Salida esperada:

```
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-0-us-east-2.pooler.supabase.com:5432"
Applying migration `20261021000000_init`
All migrations have been successfully applied.
```

```bash
npx prisma db seed
```

Tarda **entre 1 y 3 minutos**: inserta unas 200 filas una por una contra Supabase. Espera hasta ver:

```
Seeded 8 categories, 8 destinations, 31 activities, 156 reviews, 2 users
```

El seed se puede repetir sin duplicar datos (actualiza lo que ya existe).

### 3. Arrancar el API

```bash
npm run start:dev
```

Arranca bien cuando la última línea es:

```
LOG [NestApplication] Nest application successfully started
```

Antes aparecen líneas `Mapped {/auth/login, POST} route`, una por cada endpoint. Ese mensaje final solo sale si la conexión a la base funcionó.

`start:dev` se recarga solo cada vez que guardas un archivo.

### 4. Comprobar que funciona

| Qué | Dónde | Resultado esperado |
|---|---|---|
| Health | http://localhost:3000/health | `{"status":"ok", ...}` |
| Swagger (probar endpoints) | http://localhost:3000/docs | Documentación interactiva |
| Login | En Swagger: `POST /auth/login` | Devuelve `accessToken` y el usuario |

Usuarios demo:

| Email | Contraseña |
|---|---|
| `usuario@kusitrip.com` | `kusitrip123` |
| `ana@kusitrip.com` | `ana12345` |

Desde la Terminal:

```bash
curl localhost:3000/health
curl -X POST localhost:3000/auth/login -H 'content-type: application/json' \
  -d '{"email":"usuario@kusitrip.com","password":"kusitrip123"}'
```

Para endpoints con candado 🔒 en Swagger: copia el `accessToken` del login, pulsa **Authorize** (arriba a la derecha) y pégalo.

### 5. Detener el API

`Ctrl + C` en la Terminal donde corre `npm run start:dev`.

Si cerraste la Terminal y el puerto 3000 quedó ocupado:

```bash
lsof -i :3000 -sTCP:LISTEN -P   # ver qué proceso lo usa
kill <PID>                       # cerrarlo
```

### El día a día (después de la primera vez)

```bash
cd ~/Downloads/Codigo/kusitrip-api-rest
npm run start:dev
```

Solo hace falta volver a correr `npx prisma migrate deploy` cuando haya una migración nueva en `prisma/migrations/`.

---

## Opción B — Base local (PGlite, sin Supabase)

PGlite es PostgreSQL compilado a WebAssembly. Corre con Node, sin instalar Postgres ni Docker. Los datos quedan en la carpeta `.pglite/` (ignorada por git).

### 1. Apuntar el `.env` a la base local

En `.env`, reemplaza las dos URLs de Supabase por estas (puedes dejar las de Supabase comentadas con `#` para volver después):

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/postgres?sslmode=disable&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:55432/postgres?sslmode=disable&connection_limit=1"
```

### 2. Encender la base (Terminal 1)

```bash
npm run db:local
```

Lista cuando aparece `PGLiteSocketServer listening on {"port":55432,...}`. Esta Terminal queda ocupada mientras la base esté encendida.

### 3. Primera vez: tablas y datos (Terminal 2)

```bash
npx prisma migrate deploy
npx prisma db seed
```

En local el seed tarda unos segundos.

### 4. Arrancar el API (Terminal 2)

```bash
npm run start:dev
```

Se comprueba igual que en la [Opción A, paso 4](#4-comprobar-que-funciona).

### 5. Apagar

1. `Ctrl + C` en la Terminal del API.
2. `Ctrl + C` en la Terminal de la base.

Los datos se conservan. Para empezar de cero: con la base apagada, `rm -rf .pglite` y repite el paso 3.

Si la base quedó encendida en segundo plano: `pkill -INT -f "pglite-server"`.

---

## Errores comunes

### `Need to install the following packages: prisma@8...` o `No command registered for 'migrate'`

Estás **fuera de la carpeta del proyecto** (por ejemplo en `~`). `npx` no encuentra el Prisma del proyecto y ofrece descargar otra versión.

- Responde **n** si te pregunta.
- Entra a la carpeta y repite: `cd ~/Downloads/Codigo/kusitrip-api-rest`.
- Si respondiste **y**, no pasa nada: esa versión queda solo en la caché de npx y no toca el proyecto ni la base.

### `npm error Missing script: "start:dev"`

Mismo caso: no estás en la carpeta del proyecto.

### `Environment variable not found: DATABASE_URL`

No existe `.env`, o se llama `.env.local`. Debe llamarse exactamente `.env` y estar en la raíz de `kusitrip-api-rest`.

### `P1000: Authentication failed` / `password authentication failed`

La contraseña en `.env` está mal: falta reemplazarla en una de las dos líneas, quedaron corchetes `[ ]` o tiene caracteres especiales (ver el paso 1 de la Opción A).

### `P1001: Can't reach database server`

- Sin internet, o la URL está incompleta.
- El proyecto de Supabase está **pausado**: en el plan gratis se pausa tras 7 días sin uso. Reactívalo desde su panel.

### El seed "no hace nada" durante un rato

Contra Supabase es normal que tarde entre 1 y 3 minutos sin mostrar nada. Si pasan más de 5 minutos, `Ctrl + C` y vuelve a ejecutar `npx prisma db seed`.

### `warn The configuration property 'package.json#prisma' is deprecated`

No es un error. Prisma avisa de un cambio para su versión 7; el proyecto usa la 6. Se puede ignorar.

### `EADDRINUSE: address already in use :::3000`

Ya hay otra instancia del API corriendo. Ver [Detener el API](#5-detener-el-api).

---

## Conectar la app iOS al API local

En **Debug**, la app ya apunta a `http://localhost:3000` (build setting `API_BASE_URL`). Con el API corriendo, ejecuta la app en el simulador desde Xcode y entra con el usuario demo.

En un iPhone físico, `localhost` es el propio teléfono: hay que usar la IP de tu Mac en la red (por ejemplo `http://192.168.1.20:3000`).
