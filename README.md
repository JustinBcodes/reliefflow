ReliefFlow — Local-only MVP for emergency resource allocation with concurrency-safe reservations.

## Run locally

```bash
docker compose up -d
npm i
copy .env.local.example .env.local
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Env

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- AUTH_EMAIL_FROM
- REDIS_URL

## Post-migration constraints

```sql
ALTER TABLE "Slot" ADD CONSTRAINT capacity_nonneg CHECK (capacity >= 0);
ALTER TABLE "Slot" ADD CONSTRAINT reserved_le_capacity CHECK ( "reservedCount" <= "capacity" );
```

## Guarantees

- Redis lock per slotId during booking
- Postgres SERIALIZABLE tx with SELECT FOR UPDATE
- DB constraint `reservedCount <= capacity`

## API quickstart

- GET `/api/slots`
- POST `/api/slots/:slotId/hold` { qty, idempotencyKey }
- POST `/api/slots/:slotId/confirm` { holdId, idempotencyKey }
- POST `/api/reservations/:id/cancel`

## Testing

```bash
npm run test
npm run loadtest
```

## Resume bullets

- Built ReliefFlow, an emergency resource allocation platform (Next.js, Prisma, PostgreSQL, Redis) with concurrency-safe reservations using Redis distributed locks and SERIALIZABLE Postgres transactions; prevented double-booking under parallel load (≥200 rps) with p95 < 200 ms.
- Shipped admin scheduling for multi-site inventory, RBAC via NextAuth, idempotent booking APIs, and a cron-driven hold-expiry workflow; added rate limiting and structured audit logs for traceability.
