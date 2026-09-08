# ADR 0008: Docker Postgres locally, Neon in production

- Status: Accepted
- Date: 2026-09-07

## Context

The event store is ordinary PostgreSQL. Developers previously started a native
Postgres 16 cluster under `.local/postgres` from `npm run dev`, and the
deployment baseline named Supabase as both the hosted database and the Edge API
host. Native Postgres on each laptop is fragile (PATH, versions, leftover
clusters), and it is too easy to stop the database when the app stops.

The neighbouring Frames project already runs Postgres in Docker locally and Neon
in production, with an explicit TLS policy and a generated checkout-local
environment that cannot silently migrate a hosted database.

## Decision

- Local development uses Docker Engine plus Compose v2. One Postgres 16
  container is bound to loopback, backed by a named volume, and identified by a
  checkout-specific Compose project. There is no native-Postgres fallback.
- The container stays up when the API and Vite processes stop. Destroying data
  is an explicit `pnpm db:reset` or `pnpm db:destroy`.
- Production uses Neon PostgreSQL in a European region (`aws-eu-central-1` or
  `aws-eu-west-2`). The application speaks ordinary PostgreSQL: a pooled
  `DATABASE_URL` for the API and a direct `DATABASE_MIGRATION_URL` for
  release-time migrations.
- TLS is controlled only by `DATABASE_SSL_MODE`. Production requires `verify`.
  Local generated environments set `disable`. Connection URLs must not carry
  `sslmode` or other TLS parameters.
- Checkout-local credentials live in `.local/db.env` (mode `0600`, never
  rewritten). Local database commands override ambient `DATABASE_*` values so a
  leaked production URL cannot be migrated from a laptop. Production
  (`DATABASE_ENVIRONMENT=production`) never loads that file.
- This repository does not provision Neon projects, store console credentials,
  or copy production data into local or preview databases.

Supabase remains a possible future host for Edge Functions. It is not the
production database adapter.

## Consequences

Developers need Docker. `pnpm db:up` is the local database lifecycle;
`npm run dev` starts that container, then the API, customer app, and backoffice.
Migrations are checksummed in `public.schema_migrations` and applied by Node,
not by `docker-entrypoint-initdb.d`.

Operators create and region-pin the Neon project by hand, put secrets in the
host secret store, and run `pnpm db:migrate` against `DATABASE_MIGRATION_URL`
before shipping API code that needs the new schema. See
[Persistence](../../operations/persistence.md).
