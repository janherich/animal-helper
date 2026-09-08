# Database migrations

SQL migrations live here as ordinary PostgreSQL. Local development applies them
to Docker Compose Postgres. Production applies them to Neon. A future Edge host
can reuse the same files; the Supabase CLI is not required.

Do not link a developer machine to a hosted project by default. Generated dumps,
real data, service-role keys, and `.env` files are never committed.

`pnpm db:up` generates `.local/db.env` (gitignored) and applies these files
through checksummed `public.schema_migrations`. Do not edit an applied file; add
a new migration.

CI applies the same migrations to an isolated `postgres:16-alpine` service. See
[Persistence](../docs/operations/persistence.md).
