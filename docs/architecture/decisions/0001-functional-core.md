# ADR 0001: Functional TypeScript core

- Status: Accepted
- Date: 2026-07-29

## Context

The maintainers value functional architecture and event-based systems.
TypeScript is the best onboarding fit for the team and future frontend
contributors.

## Decision

Use strict TypeScript with a framework-free domain core. Domain operations are
pure functions over immutable data:

- `decide(state, command)` returns events or a typed rejection;
- `evolve(state, event)` returns the next state.

Effects are interfaces at the application boundary. Transport schemas, database
rows, framework requests, and provider responses do not enter the domain
directly. Use discriminated unions and explicit `Result` values for expected
failures.

Do not adopt PureScript, Effect, fp-ts, or a dependency-injection framework in
the baseline. Reconsider only with a focused ADR and evidence from real
complexity.

## Consequences

Domain behaviour is deterministic and cheap to test. Some conventions normally
enforced by a language or framework rely on TypeScript, linting, code review,
and package boundaries.
