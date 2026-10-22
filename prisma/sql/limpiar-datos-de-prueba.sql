-- Limpia los datos de prueba antes de salir a producción.
--
-- Borra TODAS las cuentas de usuario y lo que depende de ellas, y deja intacto
-- el catálogo (categorías, destinos, actividades y opiniones de Civitatis).
-- Instrucciones completas: docs/SALIDA-A-PRODUCCION.md
--
-- Después de ejecutarlo, corre `SEED_DEMO_USERS=false npm run db:seed:prod`
-- para devolver la valoración y el número de opiniones de cada actividad a los
-- valores del catálogo (las opiniones escritas desde la app los modificaron).

BEGIN;

-- Opiniones escritas desde la app (las del catálogo no tienen usuario).
DELETE FROM reviews WHERE "userId" IS NOT NULL;

-- Cuentas de usuario. En cascada se borran sus refresh_tokens, favorites y bookings.
DELETE FROM users;

COMMIT;
