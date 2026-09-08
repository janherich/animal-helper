# Backoffice PWA

The backoffice is a desktop/tablet-oriented online Vue 3 + Vite PWA for
individually authenticated administrators. See
[ADR 0007](../../docs/architecture/decisions/0007-vue-static-pwas.md) and
[ADR 0009](../../docs/architecture/decisions/0009-passkey-admin-auth.md).

This slice is passkey login, a read-only case queue, and a guidance matrix that
can edit injured copy, toggle applicability, and publish. It does not open
private case data or dispatch mail.

`npm run dev` from the repository root starts Docker Postgres, the API on
`http://127.0.0.1:8787`, the customer app on `http://127.0.0.1:5173`, and this
app on `http://localhost:5174`. Vite proxies `/admin` to the API so session
cookies stay first-party. Open the backoffice at `http://localhost:5174`, not at
port 8787. Use `localhost`, not `127.0.0.1` — passkeys require that hostname.

Create a named operator (no public sign-up):

```sh
pnpm admin:bootstrap -- --email you@example.com --open
```

The command writes a private HTML file with a 15-minute, one-use setup link. It
does not print the token. After opening that file, register a platform passkey,
then sign in again later with the same authenticator.

Safari stores those keys against the RP ID `localhost`, shared with every other
local site. If login offers passkeys that never succeed, they are leftovers
(failed setup, another local app, or a database reset). Delete the `localhost`
passkeys for this address in Passwords, then register one new key from a
bootstrap link:

```sh
pnpm admin:bootstrap -- --email you@example.com --open --reset-passkeys
```

The queue lists `stream_id`, workflow state, and timestamps from
`ah.case_queue_projection`. Private payloads are not loaded.

**Matica sprievodcu** (`/guidance`) browses the code-owned
`@animal-helper/guidance` catalog and edits injured copy. Save writes a draft;
publish makes that revision the public `GET /guidance` payload. Preview uses the
same resolver as the customer walk. Stray and cruelty stay read-only. Rollback,
review-date gating, and jurisdiction phone snapshots are not in this slice.

Later technical responsibilities remain:

- present the least private data needed for queue triage;
- record auditable case transitions and restricted-data reads;
- select versioned Slovak routing/form definitions;
- roll back a published guidance revision and record subject-matter review;
- confirm exact recipient and content before an idempotent dispatch;
- make retention completion, outbox failures, and security warnings visible.

There is one permission role initially, but accounts remain individual.
Publication will be an authenticated, passkey-assured, audited operation; the
editor cannot create arbitrary screens, branches, HTML, or executable rules.
