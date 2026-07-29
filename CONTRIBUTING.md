# Contributing

Thank you for helping Animal Helper.

## Before implementation

1. Read the architecture decision records under `docs/architecture/decisions`.
2. Open an issue for changes to trust boundaries, persistence semantics,
   privacy, or external providers.
3. Do not add real report data, email addresses, access capabilities,
   credentials, production exports, or identifiable media to issues, fixtures,
   screenshots, or commits.

## Development

Use Node.js 24 LTS and the exact pnpm version declared in `package.json`.

```sh
pnpm install
pnpm check
```

Keep domain decisions pure and explicit. Validate untrusted input at system
boundaries, convert it to domain commands, append resulting events atomically,
and perform external effects through an outbox or equivalent retryable
mechanism.

User-visible text belongs in locale dictionaries. Routing rules and
official-form definitions belong in jurisdiction packages, not UI components.

## Changes

- Add tests for domain invariants and security-sensitive behaviour.
- Update the relevant architecture decision when a foundational choice changes.
- Include a migration and rollback/forward-recovery note for schema changes.
- Keep pull requests small enough to review without exposing case information.

The repository will add a contributor code of conduct and organisational
governance before opening broad community contribution.
