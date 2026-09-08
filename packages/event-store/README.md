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

`pnpm db:up` starts Docker Postgres and applies checksummed migrations.
`npm run dev` does that, then starts the HTTP API. Local credentials live in
`.local/db.env`. Production uses Neon; see
[Persistence](../../docs/operations/persistence.md).
