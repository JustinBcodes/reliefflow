## About ReliefFlow

ReliefFlow is a lightweight, local-first MVP for coordinating emergency resources (e.g., shelter beds, supply pickups, clinic appointments) with strong, verifiable concurrency guarantees. It focuses on reliable booking under load by combining Redis-based distributed locks, SERIALIZABLE Postgres transactions, and explicit hold/confirm flows to prevent double-booking.

### Highlights
- **Concurrency-safe reservations**: Redis per-`slotId` locks, DB `SELECT ... FOR UPDATE`, strict constraints.
- **Idempotent APIs**: All booking actions accept `idempotencyKey` for safe retries.
- **Hold → Confirm lifecycle**: Short-lived holds with a background job to reap expirations.
- **Multi-site inventory**: Organize resources by organization and site; simple admin scheduling.
- **Security & guardrails**: RBAC via NextAuth, basic rate limiting, and structured auditability.
- **Tech stack**: Next.js App Router, TypeScript, Prisma + PostgreSQL, Redis.

### Status
- MVP intended for local development and demos; not production-hardened.

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

