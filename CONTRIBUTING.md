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

Use Node.js 24 LTS, the exact pnpm version declared in `package.json`, and a
running Docker Engine with Compose v2. See
[Persistence](docs/operations/persistence.md).

```sh
pnpm install
pnpm db:up
pnpm check
```

The backoffice is `http://localhost:5174` after `npm run dev`. Create a named
operator with `pnpm admin:bootstrap -- --email you@example.com --open`. If
Safari offers leftover `localhost` passkeys that never succeed, delete them in
Passwords and re-run bootstrap with `--reset-passkeys`. Do not commit the
generated setup HTML or `.local/db.env`.

Keep domain decisions pure and explicit. Validate untrusted input at system
boundaries, convert it to domain commands, append resulting events atomically,
and perform external effects through an outbox or equivalent retryable
mechanism.

User-visible text belongs in locale dictionaries. Routing rules and
official-form definitions belong in jurisdiction packages, not UI components.
Customer screens follow the [UI cookbook](docs/product/ui-cookbook.md).

## Changes

- Add tests for domain invariants and security-sensitive behaviour.
- Update the relevant architecture decision when a foundational choice changes.
- Include a migration and rollback/forward-recovery note for schema changes.
- Keep pull requests small enough to review without exposing case information.

The repository will add a contributor code of conduct and organisational
governance before opening broad community contribution.
