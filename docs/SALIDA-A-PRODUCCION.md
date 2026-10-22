# Checklist de salida a producción

Hoy el ambiente "prod" (Render + Supabase, scheme **KusiTrip** de la app) es infraestructura real, pero **sin usuarios reales**: tiene cuentas, reservas, favoritos y opiniones de prueba. Antes de publicar la app hay que dejarlo limpio y seguro.

Haz los pasos en orden. Los marcados con 🔴 son obligatorios; los 🟡 son recomendados.

---

## 1. 🔴 Limpiar los datos de prueba (Supabase)

Esto borra **todas las cuentas de usuario** y lo que depende de ellas: sesiones, favoritos, reservas y las opiniones escritas desde la app. El catálogo no se toca (categorías, destinos, actividades y las opiniones originales de Civitatis).

> No se puede deshacer. Si quieres conservar algo, expórtalo antes en Supabase → **Table Editor** → elige la tabla → **Export → CSV**.

### 1.1 Borrar cuentas y su actividad

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor** → **New query**.
2. Pega el contenido de [`prisma/sql/limpiar-datos-de-prueba.sql`](../prisma/sql/limpiar-datos-de-prueba.sql):

   ```sql
   BEGIN;
   DELETE FROM reviews WHERE "userId" IS NOT NULL;
   DELETE FROM users;
   COMMIT;
   ```

3. Pulsa **Run**. Debe terminar sin errores.

### 1.2 Restaurar las valoraciones del catálogo

Cada opinión escrita desde la app recalculó la valoración y el número de opiniones de su actividad. Recarga el catálogo **sin usuarios demo** para devolverlos a sus valores originales. En la Terminal, dentro de `kusitrip-api-rest`:

```bash
SEED_DEMO_USERS=false npm run db:seed:prod
```

Debe terminar con `Seeded 8 categories, 8 destinations, 31 activities, 156 reviews, 0 users` (tarda 1–3 minutos contra Supabase).

### 1.3 Comprobar

En el SQL Editor:

```sql
SELECT
  (SELECT count(*) FROM users)          AS usuarios,        -- 0
  (SELECT count(*) FROM refresh_tokens) AS sesiones,        -- 0
  (SELECT count(*) FROM favorites)      AS favoritos,       -- 0
  (SELECT count(*) FROM bookings)       AS reservas,        -- 0
  (SELECT count(*) FROM reviews)        AS opiniones,       -- 156
  (SELECT count(*) FROM activities)     AS actividades;     -- 31
```

> **Desde ahora, nunca corras `npm run db:seed:prod` sin `SEED_DEMO_USERS=false`.** Sin esa variable, el seed vuelve a crear `usuario@kusitrip.com` y `ana@kusitrip.com`, cuyas contraseñas están publicadas en el repo y en la app.

El mismo SQL sirve para la base local de desarrollo, pero ahí no hace falta: los datos de prueba son justamente para eso.

---

## 2. 🔴 Cambiar las credenciales

Las credenciales actuales se usaron durante el desarrollo; las de la base de datos incluso se compartieron en un chat. Hay que reemplazarlas.

### 2.1 Contraseña de la base de datos

1. Supabase → **Project Settings → Database → Reset database password**. Genera una sin `@ : / ? # %` (rompen la URL).
2. Reemplázala en `.env.production` (en `DATABASE_URL` y `DIRECT_URL`).
3. Reemplázala en Render → tu servicio → **Environment** (`DATABASE_URL` y `DIRECT_URL`) → **Save Changes**. Render redespliega solo.

### 2.2 Secretos JWT

Genera dos valores nuevos con `openssl rand -hex 32` y ponlos en Render → **Environment** (`JWT_SECRET` y `JWT_REFRESH_SECRET`) y en `.env.production`.

Esto invalida todas las sesiones abiertas: es lo que queremos, porque solo eran sesiones de prueba.

### 2.3 Comprobar

```bash
curl https://kusitrip-api-rest.onrender.com/health     # {"status":"ok",...}
```

Si responde error, revisa en Render → **Logs** que las URLs no tengan comillas ni espacios.

---

## 3. 🔴 App iOS

| Qué | Dónde | Por qué |
|---|---|---|
| Quitar el recuadro "Credenciales de demo" | `LoginView.swift` | Los usuarios demo ya no existen y no deben aparecer en la app publicada |
| **Permitir eliminar la cuenta desde la app** | Perfil + nuevo endpoint `DELETE /auth/me` en el API | Apple lo exige a toda app que permita crear cuentas (App Store Review Guideline 5.1.1(v)). Sin esto, rechazan la app |
| Política de privacidad (URL pública) | App Store Connect y un enlace en Perfil | Obligatoria en App Store Connect |
| "Privacidad de la app" en App Store Connect | App Store Connect → App Privacy | Declarar los datos que se recogen: nombre, email, reservas y favoritos, vinculados a la cuenta y sin rastreo |
| Archivar con el scheme **KusiTrip** | Xcode → Product → Archive | Usa la configuración `Release` → API de Render. Nunca archives `KusiTrip-Dev` para la App Store: apunta a `localhost` |
| Resolver o esconder la UI sin función | Ver "Pendientes conocidos" en el README de la app | "¿Olvidaste tu contraseña?" no hace nada, los chips de categoría del Inicio no filtran, la valoración "9,1/10" es fija |

---

## 4. 🟡 Infraestructura

| Qué | Por qué |
|---|---|
| **Render Starter (US$ 7/mes)** | El servidor nunca se apaga. Con eso puedes desactivar el workflow `keep-alive.yml` (Actions → Keep Render awake → Disable workflow) o dejarlo como monitor |
| **Backups de la base** | El plan gratis de Supabase no incluye backups automáticos descargables. El plan Pro tiene backups diarios. Como mínimo, haz un `pg_dump` periódico con la `DIRECT_URL` |
| **Fotos del catálogo** | Hoy apuntan al CDN de Civitatis (`f.civitatis.com`). Para uso comercial hay que tener permiso o usar fotos propias, y servirlas desde Supabase Storage |
| **Swagger (`/docs`)** | Hoy es público en producción. No expone datos (los endpoints privados piden token), pero puedes ocultarlo con una variable de entorno si prefieres no mostrar la API |

---

## 5. Resumen del día del lanzamiento

1. Exportar lo que quieras conservar (opcional).
2. Limpiar datos: SQL + `SEED_DEMO_USERS=false npm run db:seed:prod` + comprobar ([paso 1](#1--limpiar-los-datos-de-prueba-supabase)).
3. Cambiar contraseña de la base y secretos JWT en Render y `.env.production` ([paso 2](#2--cambiar-las-credenciales)).
4. `curl .../health` → `ok`.
5. Abrir la app de producción, crear una cuenta real y probar: reservar, favoritos, cerrar sesión, volver a entrar.
6. Archivar con el scheme **KusiTrip** y subir a App Store Connect.
