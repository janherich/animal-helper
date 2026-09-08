# ADR 0004: Vercel Pro runtime with portable Neon and adapters

- Status: Accepted (amended 2026-09-08)
- Date: 2026-07-29
- Amendment: 2026-09-08

## Context

The project needs minimal operations and cost. It handles sensitive reports, and
the operator is an organisation (not a personal Hobby account). The neighbouring
Frames project already runs Vue static apps plus Node HTTP adapters on Vercel,
with Neon as a separately hosted PostgreSQL service.

The original 2026-07-29 decision kept Vercel static-only so report bodies would
not transit Vercel functions, and named Cloudflare R2 for private media. That
split added vendors (R2, a separate API host) without a technical need: the
command API is already a portable composition root, and Vercel Pro provides
functions, private Blob stores in `fra1`, and Queues.

## Decision

Run production on an **organisation Vercel Pro** team in Frankfurt (`fra1`),
with **Neon** as the system of record in a matching EU region
(`aws-eu-central-1` preferred).

- `apps/customer` and `apps/backoffice` remain Vue static PWAs (ADR 0007).
- `apps/api` is deployed as Vercel Functions (same handler as the local Node
  HTTP server; no Vercel APIs in the domain layer).
- Media uses a **private Vercel Blob** store created in `fra1`. Clients upload
  through short-lived signed URLs; objects stay private. The region cannot be
  changed later.
- Asynchronous work (email outbox, purge, orphan cleanup) uses **Vercel
  Queues** (and cron where a schedule is enough). Do not require an always-on
  VM. Queues is a Vercel public-beta product; confirm DPA coverage at purchase.
- Email stays behind a provider adapter (Brevo in the operator handoff).
- PostgreSQL remains ordinary Postgres (ADR 0008). Do not use Vercel Postgres
  as a second store.

No domain code depends on Vercel request types, Blob URLs, Queue payloads,
Neon-specific SQL, or a particular email provider. Each is an adapter around
the same composition root.

Disable Vercel AI / model-training products on this team. Case data may transit
Functions, Blob, and Queues only as a documented processor under the operator
DPA.

## Consequences

The operator bill of materials is Vercel Pro, Neon, Brevo, and a domain — the
same shape as Frames. Cloudflare R2, Turnstile, and a separate API host (for
example Fly.io) are not required for v1. Bot challenge can stay rate limits and
spend caps until evidence requires another vendor.

Counsel must treat Vercel as a processor of report content and media, not
merely a static CDN. Function payload size still cannot carry large videos:
signed Blob uploads remain mandatory.

Hobby is not used. Pro spend management and regional Blob/function placement
are part of launch, not optional extras.
