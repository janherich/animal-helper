# Contracts

Versioned, runtime-validated command and query transport schemas.

Rules:

- reject unknown fields at public write boundaries;
- encode text, count, size, and enum bounds once;
- distinguish wire types from domain types;
- use explicit schema versions and compatibility tests;
- publish no database row or provider response as an API contract;
- keep fixtures synthetic and free of personal data.

Zod validates the first case-command contracts. Domain commands never carry
private payloads; those stay in the transport envelope until the event-store
writes them to erasable private records.

The injured/stray happy path uses versioned private-record payloads:
`form_snapshot`, `location`, `media_ref`, and `contact`. Cruelty, dead-animal,
and other-situation branches are rejected until their schemas exist.
