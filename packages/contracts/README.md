# Contracts

This package will hold versioned, runtime-validated command/query/event
transport schemas and generated TypeScript types.

Rules:

- reject unknown fields at public write boundaries;
- encode text, count, size, and enum bounds once;
- distinguish wire types from domain types;
- use explicit schema versions and compatibility tests;
- publish no database row or provider response as an API contract;
- keep fixtures synthetic and free of personal data.

Zod is the initial candidate because it is familiar in TypeScript, but it will
be added only when the first approved contract exists.
