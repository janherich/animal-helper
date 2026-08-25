# Database migrations

SQL migrations live here so they can later deploy to Supabase. Local development
does not need the Supabase CLI: `npm run dev` starts an isolated Postgres 16
cluster and applies these files.

Do not link a developer machine to a hosted project by default. Generated dumps,
real data, service-role keys, and `.env` files are never committed.

Default local database URL:

```text
postgres://postgres@127.0.0.1:55432/animal_helper
```

CI applies the same migrations to an isolated Postgres service.
