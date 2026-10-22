# Levantar el API en local

Guía para correr `kusitrip-api-rest` en tu Mac. Hay un archivo de variables por ambiente:

| Ambiente | Archivo | Base de datos | Comando del API | App iOS |
|---|---|---|---|---|
| **Development** | `.env.development` | PostgreSQL local (PGlite, carpeta `.pglite/`) | `npm run start:dev` | Scheme **KusiTrip-Dev** |
| **Production** | `.env.production` | Supabase | `npm run start:dev:prod` | Scheme **KusiTrip** (va a Render, no a tu Mac) |

Lo normal es trabajar en **Development**: tus pruebas (reservas, favoritos, usuarios) no tocan los datos reales.

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

## Development: base local

### 1. Crear `.env.development` (solo la primera vez)

```bash
cp .env.development.example .env.development
open -e .env.development
```

Las URLs de la base local ya vienen listas. Solo reemplaza `JWT_SECRET` y `JWT_REFRESH_SECRET`: genera cada uno con `openssl rand -hex 32` (dos valores distintos).

### 2. Encender la base (Terminal 1)

```bash
npm run db:local
```

Lista cuando aparece:

```
PGLiteSocketServer listening on {"port":55432,"host":"127.0.0.1"}
```

Esta Terminal queda ocupada mientras la base esté encendida.

### 3. Crear las tablas y cargar los datos (Terminal 2, solo la primera vez)

```bash
npm run db:migrate
npm run db:seed
```

En local tarda unos segundos. Al final aparece `The seed command has been executed`.

### 4. Arrancar el API (Terminal 2)

```bash
npm run start:dev
```

Arranca bien cuando la última línea es:

```
LOG [NestApplication] Nest application successfully started
```

Antes aparecen líneas `Mapped {/auth/login, POST} route`, una por cada endpoint. `start:dev` se recarga solo cada vez que guardas un archivo.

### 5. Comprobar que funciona

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

### 6. Apagar

1. `Ctrl + C` en la Terminal del API.
2. `Ctrl + C` en la Terminal de la base.

Los datos se conservan en `.pglite/`. Para empezar de cero: con la base apagada, `rm -rf .pglite`, enciéndela y repite el paso 3.

Si cerraste las Terminales y algo quedó encendido:

```bash
lsof -ti :3000 -sTCP:LISTEN | xargs kill   # el API
pkill -INT -f "pglite-server"              # la base
```

### El día a día (después de la primera vez)

```bash
cd ~/Downloads/Codigo/kusitrip-api-rest
npm run db:local     # Terminal 1
npm run start:dev    # Terminal 2
```

Solo hace falta volver a correr `npm run db:migrate` cuando haya una migración nueva en `prisma/migrations/`.

---

## Production: Supabase

Render no usa ningún archivo: toma las variables de su panel (**Environment**). `.env.production` es para trabajar contra Supabase **desde tu Mac**:

- Aplicar migraciones nuevas: `npm run db:migrate:prod`.
- Volver a cargar el catálogo: `npm run db:seed:prod`.
- Ver los datos: `npm run db:studio:prod`.
- Depurar el API con los datos reales: `npm run start:dev:prod`. No necesita `npm run db:local`.

### Crear `.env.production` (solo la primera vez)

```bash
cp .env.production.example .env.production
open -e .env.production
```

En Supabase: **Connect** (botón arriba del proyecto) → **ORMs** → **Prisma** → pestaña **`.env.local`**. Copia las dos líneas y **pégalas en `.env.production`**.

El archivo debe quedar así (con tu contraseña en lugar de `TU-CONTRASEÑA`, **en las dos líneas**):

```env
DATABASE_URL="postgresql://postgres.<ref>:TU-CONTRASEÑA@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:TU-CONTRASEÑA@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

JWT_SECRET="..."
JWT_REFRESH_SECRET="..."

PORT=3000
NODE_ENV=production
```

- La contraseña va **entre `:` y `@`**, sin corchetes.
- A `DATABASE_URL` (puerto **6543**) hay que **agregarle `&connection_limit=1`** al final. Supabase no lo incluye.
- Usa los mismos `JWT_SECRET` y `JWT_REFRESH_SECRET` que pusiste en Render.
- Si la contraseña tiene `@ : / ? # %`, rompe la URL. Es más fácil generar una nueva en Supabase → **Project Settings → Database → Reset database password**. Si la cambias, actualízala también en Render.

### Migrar y cargar datos en Supabase

```bash
npm run db:migrate:prod
```

Salida esperada:

```
Datasource "db": PostgreSQL database "postgres", schema "public" at "aws-0-us-east-2.pooler.supabase.com:5432"
All migrations have been successfully applied.
```

```bash
npm run db:seed:prod
```

Tarda **entre 1 y 3 minutos**: inserta unas 200 filas una por una contra Supabase. El seed se puede repetir sin duplicar datos (actualiza lo que ya existe).

---

## Errores comunes

### `Need to install the following packages: prisma@8...` o `No command registered for 'migrate'`

Estás **fuera de la carpeta del proyecto** (por ejemplo en `~`), o ejecutaste `npx prisma ...` directamente. Usa los scripts `npm run db:...`: ya eligen el archivo de variables correcto.

- Responde **n** si te pregunta.
- Entra a la carpeta y repite: `cd ~/Downloads/Codigo/kusitrip-api-rest`.

### `npm error Missing script: "start:dev"`

Mismo caso: no estás en la carpeta del proyecto.

### `Environment variable not found: DATABASE_URL`

Falta `.env.development` o `.env.production` (según el comando), o lo nombraste distinto. Créalo copiando su `.example`. Los comandos `npx prisma ...` sueltos no cargan ninguno de los dos: usa `npm run db:...`.

### `P1001: Can't reach database server` en development

La base local está apagada. Enciéndela con `npm run db:local` en otra Terminal.

### `P1000: Authentication failed` / `password authentication failed`

La contraseña de Supabase en `.env.production` está mal: falta reemplazarla en una de las dos líneas, quedaron corchetes `[ ]` o tiene caracteres especiales.

### `P1001: Can't reach database server` en production

- Sin internet, o la URL está incompleta.
- El proyecto de Supabase está **pausado**: en el plan gratis se pausa tras 7 días sin uso. Reactívalo desde su panel.

### El seed de producción "no hace nada" durante un rato

Contra Supabase es normal que tarde entre 1 y 3 minutos sin mostrar nada. Si pasan más de 5 minutos, `Ctrl + C` y vuelve a ejecutar `npm run db:seed:prod`.

### La base local se queda colgada

PGlite atiende las conexiones de una en una. Si cortaste un `migrate` o un `seed` a medias, apaga la base (`Ctrl + C`), vuelve a encenderla y repite el comando.

### `warn The configuration property 'package.json#prisma' is deprecated`

No es un error. Prisma avisa de un cambio para su versión 7; el proyecto usa la 6. Se puede ignorar.

### Render: `sh: 1: nest: not found`

El build en Render instaló solo las dependencias de producción (en el log se ve `added 181 packages`). Pasa porque `NODE_ENV=production` hace que `npm install` omita las devDependencies, y `nest build` las necesita.

En Render → **Settings → Build Command**:

```
npm install --include=dev && npm run build
```

### `EADDRINUSE: address already in use :::3000`

Ya hay otra instancia del API corriendo. Ver [Apagar](#6-apagar).

---

## Conectar la app iOS

| Scheme en Xcode | Llama a | Base de datos |
|---|---|---|
| **KusiTrip-Dev** | `http://localhost:3000` (`npm run start:dev`) | Local (PGlite) |
| **KusiTrip** | `https://kusitrip-api-rest.onrender.com` | Supabase |

Para Dev: enciende la base y el API ([día a día](#el-día-a-día-después-de-la-primera-vez)), elige **KusiTrip-Dev** en Xcode y pulsa Run.

En un iPhone físico, `localhost` es el propio teléfono: en `Configuration/Dev.xcconfig` de la app, cambia `API_BASE_URL` por la IP de tu Mac en la red (por ejemplo `http:/$()/192.168.1.20:3000`).
