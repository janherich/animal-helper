# Supabase infrastructure

This tree will contain reviewed PostgreSQL migrations and Edge Function
deployment entry points.

The platform spike must provide local commands for:

- starting an isolated Supabase stack;
- resetting and applying all migrations;
- generating types from the schema;
- running event-store/RLS/capability/outbox integration tests;
- rebuilding projections;
- purging a synthetic case and verifying object/contact deletion.

Do not link a developer's local project to production by default. Generated
dumps, real data, service-role keys, and `.env` files are never committed.
