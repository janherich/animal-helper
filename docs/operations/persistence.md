# Persistence

PostgreSQL is the system of record. Local development uses Docker Compose.
Production uses Neon in a European region. The application does not depend on
Neon-specific SQL, the Supabase client, or a machine-wide Postgres install.

## Local Docker Postgres

Requirements: Node.js 24, pnpm 11.18.0, and a running Docker Engine with Compose
v2. Homebrew Postgres is not used.

```sh
pnpm db:up       # generate .local/db.env if missing, start, migrate
pnpm db:status
pnpm db:down     # stop the container; keep the volume
pnpm db:reset    # delete the volume, then up
pnpm db:destroy  # stop and delete the volume
pnpm db:migrate  # apply pending SQL without restarting Compose
```

`pnpm db:up` writes `.local/db.env` once (mode `0600`) with a random password,
loopback port `55432`, Compose project `ah-<checkout>-<hash>`,
`DATABASE_SSL_MODE=disable`, the well-known local `CAPABILITY_PEPPER`, and
`DATABASE_TEST_URL` pointing at a sibling `animal_helper_test` database.
Existing files are never rewritten. Local database commands override ambient
`DATABASE_URL` / `DATABASE_MIGRATION_URL` so they cannot migrate a hosted
database by accident. `pnpm db:up` and `pnpm db:migrate` also create and migrate
that test database. Integration tests that drop schema run only there.

The Compose file binds `127.0.0.1` only, uses a named volume, and waits for
`pg_isready`. It does not mount SQL under `/docker-entrypoint-initdb.d`. Node
applies `supabase/migrations/*.sql` through checksummed
`public.schema_migrations`. Editing an already-applied file fails closed; add a
new migration instead.

`npm run dev` runs `pnpm db:up`, then the API, the customer Vite app, and the
backoffice Vite app. Ctrl+C stops the API and Vite only. Postgres stays up. Stop
it with `pnpm db:down` when you no longer need it.

New `.local/db.env` files also include `ADMIN_ORIGIN=http://localhost:5174`.
Existing files are never rewritten; the API still defaults to that origin
locally. Production requires an exact `https` `ADMIN_ORIGIN` or admin routes
stay disabled.

Worktrees get distinct Compose projects from the checkout path, so two checkouts
do not share a container or volume.

If an old native cluster still exists under `.local/postgres`, `pnpm db:up`
tries to stop it before binding port `55432`.

## Production Neon

Create the Neon project yourself. Do not commit console tokens, connection
strings, or a `.neon` directory.

1. Create a project in `aws-eu-central-1` (Frankfurt) or `aws-eu-west-2`
   (London). The region cannot be changed later.
2. Create a dedicated database role for the application. Do not put the project
   owner credential in the API process.
3. Copy the **pooled** connection string into `DATABASE_URL` and the **direct**
   connection string into `DATABASE_MIGRATION_URL`. Strip any `sslmode` or other
   TLS query parameters.
4. Set the following in the host secret store, never in git:

   ```sh
   DATABASE_ENVIRONMENT=production
   DATABASE_URL=                    # neon pooled host
   DATABASE_MIGRATION_URL=          # neon direct host
   DATABASE_SSL_MODE=verify
   CAPABILITY_PEPPER=               # at least 32 bytes of hex, unique to prod
   ADMIN_ORIGIN=                    # exact https origin of the admin SPA
   ```

5. Run `DATABASE_ENVIRONMENT=production pnpm db:migrate` as a release step
   before API processes start using the new schema.
6. Confirm the Neon/Databricks DPA, subprocessors, and restore window before
   admitting real reports. Free-plan history is short; Launch adds a longer
   restore window. See the [cost model](cost-model.md).

Media is a private Vercel Blob store in `fra1`, not this database. Blob tokens
stay in the Vercel project; they are not committed.

Production connections require `DATABASE_SSL_MODE=verify`. Repair the
certificate chain instead of disabling verification. `require` and `disable` are
rejected when `DATABASE_ENVIRONMENT=production`.

Preview and local environments use only generated or synthetic data. Never
restore a production dump onto a laptop or a pull-request database.

## CI

GitHub Actions starts `postgres:16-alpine` as a job service and sets
`DATABASE_URL`, `DATABASE_TEST_URL`, and `DATABASE_SSL_MODE=disable`.
Integration tests create the sibling `animal_helper_test` database if needed,
then apply migrations there. CI does not run Docker Compose or talk to Neon.

Guidance copy uses ordinary versioned tables (`ah.guidance_revisions`, cells,
copy, and a publication pointer), not the case event stream.
