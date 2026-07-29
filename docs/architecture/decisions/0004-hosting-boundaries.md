# ADR 0004: Static edge hosting and portable managed data services

- Status: Accepted
- Date: 2026-07-29

## Context

The project needs minimal operations and cost. It also handles sensitive
reports, and the likely future transfer from a personal GitHub account to an
organisation may affect free-plan eligibility.

## Decision

Host only static PWA assets on Vercel. Send report data directly to a
Supabase-hosted Edge API and signed uploads directly to a private Cloudflare R2
bucket. Use PostgreSQL as the durable system of record. Put email behind a
provider adapter.

No domain code depends on Vercel request/runtime APIs, Supabase client-side
table access, R2-specific object URLs, or a particular email payload.

## Consequences

Sensitive payloads avoid the static host, and each provider can be replaced.
There are three operational vendors. CORS, service credentials, DPAs, regions,
quotas, and incident status must be managed explicitly.

Before launch, confirm that the repository owner and deployment arrangement
remain eligible for Vercel Hobby. If not, budget for Pro or move static hosting
to another provider without changing application architecture.
