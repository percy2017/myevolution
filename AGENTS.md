# Evolution API — Guía para Agentes

API de WhatsApp multi-tenant (Node 22, TS 5, Express 4, Prisma ORM, Baileys 7).

## Stack Local

- **OS**: Ubuntu 22.04
- **Node**: v22.22.2 via nvm
- **Runtime**: `node dist/main` (modo producción, no `tsx`)
- **Process Manager**: **pm2** (`evolution-api`, `chatwoot`, `chat-ui`, `tvp-pos`)
- **Proxy**: nginx 1.18.0 (`evolution.local` → `127.0.0.1:8080`)
- **BD**: PostgreSQL 18.3
- **Cache**: Redis 8.6.2
- **Docker**: instalado sin contenedores activos
- **WebSocket**: Socket.IO habilitado (requiere `WEBSOCKET_ENABLED=true` + `WEBSOCKET_ALLOWED_HOSTS=*`)
- **Integraciones**: Chatwoot activo (webhook en `http://evolution.local/chatwoot/webhook/:instanceName`), webhooks globales por WebSocket
- **Hosts locales**: `chatwoot.local` → 127.0.0.1, `evolution.local` → 127.0.0.1 (vía nginx en puerto 80)

## Procesos pm2

Todos los servicios corren bajo pm2 con autoreinicio:

```bash
pm2 list                          # Ver todos los procesos
pm2 logs evolution-api            # Logs en tiempo real
pm2 logs evolution-api --lines 200 --nostream  # Últimas líneas
pm2 restart evolution-api          # Reiniciar Evolution API
pm2 reload all                     # Recargar todos los procesos
pm2 save                           # Guardar lista de procesos para reinicio automático
pm2 startup                        # Configurar pm2 para iniciar con el sistema
```

Archivos de log:
- `/home/percy/evolution-api/logs/pm2-out.log` — stdout de evolution-api
- `/home/percy/evolution-api/logs/pm2-error.log` — stderr (errores, warnings)
- Los logs de `chatwoot` y `chat-ui` están en `~/.pm2/logs/`

### Solución de problemas comunes

**Chatwoot no recibe mensajes**: El token de API (`api_access_token`) en la tabla `Chatwoot` de la BD puede estar desactualizado. Obtener nuevo token desde Settings → API → Token de acceso en Chatwoot y actualizar:

```sql
UPDATE "Chatwoot" SET token = 'nuevo_token', "updatedAt" = NOW();
```

Luego reiniciar evolution-api: `pm2 restart evolution-api`

## Comandos

```bash
npm run dev:server        # tsx watch — recarga automática (desarrollo)
npm start                 # tsx ./src/main.ts — ejecución única (sin watch)
npm run build             # tsc --noEmit && tsup (CJS+ESM, minificado, sourcemaps)
npm run start:prod        # node dist/main
npm run lint              # eslint --fix --ext .ts src
npm run lint:check        # eslint --ext .ts src (sin arreglar)
npm run commit            # Commitizen interactivo
npm test                  # tsx watch ./test/all.test.ts — no hay tests reales
```

## Hooks

- **Pre-commit** (`husky`): `npx lint-staged` — ejecuta eslint --fix en .ts/.js staged + tsc --noEmit.
- **Pre-push** (`husky`): `npm run build && npm run lint:check` — la puerta de CI real.

## Base de datos (Prisma)

**Debe definir `DATABASE_PROVIDER=postgresql|mysql|psql_bouncer` antes de cualquier comando de BD.**
`psql_bouncer` usa las migrations/schema de `postgresql` pero lee `DATABASE_BOUNCER_CONNECTION_URI` (con `directUrl` fallback a `DATABASE_CONNECTION_URI`).

Archivos de schema: `prisma/{postgresql,mysql,psql_bouncer}-schema.prisma`.
Migrations: `prisma/{postgresql,mysql}-migrations/` (psql_bouncer reutiliza postgresql).
Todos los scripts `npm run db:*` pasan por `runWithProvider.js` — **no** llame a `npx prisma` directamente.
`DATABASE_CONNECTION_CLIENT_NAME` separa instalaciones que comparten la misma BD.

```bash
npm run db:generate         # prisma generate
npm run db:migrate:dev      # copia migrations, ejecuta migrate dev, sincroniza
npm run db:deploy           # copia migrations, ejecuta migrate deploy
npm run db:studio           # prisma studio
```

## Arquitectura

- **Entrypoint**: `src/main.ts` — `import '@utils/instrumentSentry'` debe ser lo primero (inicialización de Sentry antes que todo).
- **Contenedor DI**: `src/api/server.module.ts` — cableado manual (sin NestJS/Inversify). Exporta `waMonitor`, `cache`, controladores y servicios como singletons simples.
- **Patrón de rutas**: `RouterBroker` (`src/api/abstract/abstract.router.ts`) — las rutas llaman a `this.dataValidate<T>({ request, schema, ClassRef, execute })` que valida contra JSONSchema7 y luego despacha al controlador. `express-async-errors` se importa dentro de este archivo.
- **Controladores** son delgados; la lógica de negocio vive en **servicios** (`src/api/services/`).
- **DTOs** son clases planas (sin decoradores, sin `class-validator` aunque esté en dependencias).
- **Validación**: Schemas JSONSchema7 en `src/validate/` + `src/api/integrations/*/*.schema.ts`.
- **Auth**: Middleware guard en `src/api/guards/` — clave API vía header `apikey`.
- **Instancia de WhatsApp**: `WAMonitoringService` (`src/api/services/monitor.service.ts`) contiene `waInstances: Record<string, any>` keyed por nombre de instancia.
- **Rutas**: definidas en `src/api/routes/index.router.ts` — montadas en `/instance`, `/message`, `/chat`, `/group`, `/settings`, `/proxy`, `/label`, `/call`, `/business`, `/template`, `/manager`.
- **Web UI**: servida desde `manager/dist/` (versionada, no construida por tsup). Deshabilitada via `SERVER.DISABLE_MANAGER`.
- **Submódulo**: `evolution-manager-v2` (repositorio separado, no inicializado en checkout local).
- **Prometheus**: endpoint `/metrics` habilitado con `PROMETHEUS_METRICS=true`, con whitelist de IP y autenticación básica opcionales.
- **i18n**: la variable de entorno `LANGUAGE=en` lee traducciones de `src/utils/translations/` (copiado a dist en el build).

## Alias de importación (tsconfig paths)

`@api/*` → `src/api/*`, `@config/*` → `src/config/*`, `@cache/*` → `src/cache/*`, `@utils/*` → `src/utils/*`, `@exceptions` → `src/exceptions`, `@validate/*` → `src/validate/*`, `@libs/*` → `src/libs/*`.

## Convenciones

- Comillas simples, sangría de 2 espacios, comas finales, ancho de 120 caracteres, punto y coma — aplicado por ESLint + Prettier.
- Nombres de archivo `kebab-case.file.ts`, clases `PascalCase`, funciones/variables `camelCase`.
- Commits: conventional commits (`type(scope): subject` ≤ 100 caracteres) via commitizen + commitlint.
- Comunicación con el usuario: **Portugués (PT-BR)**. Código y respuestas de la API: Inglés.
- No existe suite de tests (`test/` está en gitignore).
- `strict: false`, `strictNullChecks: false`, `noImplicitAny: false` en tsconfig.
