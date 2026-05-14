# Evolution API

WhatsApp multi-tenant API — Node 22, TypeScript 5, Express 4, Prisma ORM, Baileys 7.

## Stack

- **Runtime**: Node 22 (via nvm)
- **Process Manager**: pm2
- **Database**: PostgreSQL
- **Cache**: Redis
- **WebSocket**: Socket.IO

---

## Setup

### 1. Prerequisitos

- **Node 22** (recomendado via nvm)
- **PostgreSQL** (local o remoto)
- **Redis** (local o remoto)

### 2. Clonar e instalar dependencias

```bash
git clone https://github.com/percy2017/myevolution.git
cd myevolution
npm install
```

### 3. Configurar variables de entorno

```bash
cp env.example .env
```

Editar `.env` con tus datos — mínimo requerido:

```env
SERVER_URL=http://localhost:8080

DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://usuario:senha@localhost:5432/evolution_api

CACHE_REDIS_URI=redis://localhost:6379

AUTHENTICATION_API_KEY=tu_api_key_secreta
```

> `DATABASE_CONNECTION_URI` sigue el formato: `postgresql://user:password@host:port/database`

### 4. Crear la base de datos

Conéctate a PostgreSQL y crea la base de datos:

```sql
CREATE DATABASE evolution_api;
```

O desde terminal:

```bash
createdb evolution_api
```

### 5. Migrar la base de datos

Esto genera el cliente Prisma y ejecuta las migrations:

```bash
npm run db:generate
npm run db:deploy
```

> Ambos comandos leen `DATABASE_PROVIDER` del `.env` y usan el schema/migrations correspondientes.

### 6. Compilar e iniciar

**Desarrollo** (con recarga automática):

```bash
npm run dev:server
```

**Producción**:

```bash
npm run build
npm run start:prod
```

---

## Uso con pm2 (producción)

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Otros comandos útiles:

```bash
pm2 list                          # Todos los procesos
pm2 logs evolution-api            # Logs en tiempo real
pm2 restart evolution-api          # Reiniciar
```

---

## Scripts disponibles

```bash
npm run dev:server      # Desarrollo con hot-reload (tsx watch)
npm run build           # Compilar a dist/ (tsc + tsup)
npm run start:prod      # node dist/main
npm run lint            # ESLint --fix
npm run db:generate     # Generar cliente Prisma
npm run db:deploy       # Ejecutar migrations en producción
npm run db:migrate:dev  # Crear nueva migration (desarrollo)
npm run db:studio       # Abrir Prisma Studio
```

---

## Variables de entorno principales

| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_PROVIDER` | `postgresql` | `postgresql` / `mysql` / `psql_bouncer` |
| `DATABASE_CONNECTION_URI` | — | URI de conexión a la base de datos |
| `AUTHENTICATION_API_KEY` | — | API key global (header `apikey`) |
| `SERVER_PORT` | `8080` | Puerto HTTP |
| `SERVER_URL` | — | URL pública del servidor |
| `CACHE_REDIS_URI` | `redis://localhost:6379/6` | Conexión a Redis |
| `LOG_LEVEL` | `ERROR,WARN,DEBUG,...` | Niveles de log |
| `WEBSOCKET_ENABLED` | `false` | Habilitar Socket.IO |

Ver `env.example` para todas las opciones disponibles (RabbitMQ, Kafka, SQS, S3, Chatwoot, Typebot, OpenAI, etc.).

---

## Endpoints principales

| Ruta | Descripción |
|---|---|
| `/instance` | Gestionar instancias de WhatsApp |
| `/message` | Enviar/recibir mensajes |
| `/chat` | Gestionar chats |
| `/group` | Gestionar grupos |
| `/settings` | Configuración de instancia |
| `/webhook` | Webhooks |
| `/manager` | Web UI (si está habilitado) |
| `/docs` | Swagger (si está habilitado) |