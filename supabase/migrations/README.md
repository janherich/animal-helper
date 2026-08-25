# Migrations

Commit forward-only, reviewed SQL migrations here once the data model is
exercised by an integration test.

Each migration must document compatibility, locking/availability implications,
private-data and retention effects, and a roll-forward recovery path. Production
schema changes are never made manually through a dashboard.

The first migration creates schema `ah`: event stream, accepted commands,
erasable private records, capability hashes, projections, outbox, and audit.
