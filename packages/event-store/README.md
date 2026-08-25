# Event store

PostgreSQL adapter for the case event stream. It applies a domain command in one
transaction: append events, update projections, enqueue outbox work, and record
command idempotency.

Private payloads are written only to `ah.private_records`. Event rows, audit
rows, and outbox items stay free of report text, contact details, locations, and
capabilities.

```sh
npm run dev
pnpm --filter @animal-helper/event-store test
```

`npm run dev` starts the isolated cluster and the HTTP API, and writes
`DATABASE_URL` to `.env` (if missing) and `.local/postgres/env`.
