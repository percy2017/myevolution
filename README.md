# Evolution API

WhatsApp multi-tenant API — Node 22, TypeScript 5, Express 4, Prisma ORM, Baileys 7.

## Stack

- **Runtime**: Node 22 via nvm
- **Process Manager**: pm2 (evolution-api, chatwoot, chat-ui, tvp-pos)
- **Proxy**: nginx (evolution.local → 127.0.0.1:8080)
- **Database**: PostgreSQL 18
- **Cache**: Redis 8
- **WebSocket**: Socket.IO

## Comandos

```bash
npm run dev:server      # Desarrollo con recarga automática
npm run build           # Compilar a dist/
npm run start:prod      # node dist/main
npm run lint            # ESLint --fix
```

## pm2

```bash
pm2 list                          # Todos los procesos
pm2 logs evolution-api            # Logs en tiempo real
pm2 restart evolution-api          # Reiniciar
pm2 save                           # Guardar lista para reinicio automático
```

## Chatwoot — Solución de problemas

Si los mensajes no llegan a Chatwoot, el token de API puede estar desactualizado:

```sql
UPDATE "Chatwoot" SET token = 'nuevo_token', "updatedAt" = NOW();
```

Luego: `pm2 restart evolution-api`
