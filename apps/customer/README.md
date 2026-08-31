# Customer PWA

The customer application is a mobile-first, installable, anonymous Vue 3 + Vite
PWA. Screens follow approved Figma work; writes go through
`@animal-helper/client` and versioned commands. See
[ADR 0007](../../docs/architecture/decisions/0007-vue-static-pwas.md).

This slice is an injured/stray skeleton, not the visual design. Routes follow
the [case-matrix screen map](../../docs/product/case-matrices/screen-map.md):

| Path         | Screen      | Client call                          |
| ------------ | ----------- | ------------------------------------ |
| `/w01`       | W01         | `openDraft`                          |
| `/w03`       | W03a/b      | `attachLocation`                     |
| `/w09`       | W04/W09/W11 | `attachFormSnapshot` (photo skipped) |
| `/w24`       | W24         | `attachContact` then `submitDraft`   |
| `/thank-you` | thanks      | public status                        |

`/w24` is reporter contact in this skeleton. The matrices use W24 for “who
helped”. Species, do/don't, and typed contacts are not rendered yet; keys live
in `@animal-helper/guidance`.

`npm run dev` from the repository root starts isolated Postgres, the API on
`http://127.0.0.1:8787`, and this Vite app on `http://127.0.0.1:5173`. The local
API allows that exact origin. The in-memory store resets on reload.

Its remaining technical responsibilities are:

- `sk-SK` application chrome sourced from locale dictionaries, with
  administrator-managed advice from a locale-scoped published revision;
- a fixed-screen injured-animal guidance flow driven by the active compatible
  public guidance revision;
- bounded text/media capture;
- IndexedDB draft and idempotent command queue;
- clear local-versus-server durability status;
- private signed media upload;
- case capability creation/import/removal;
- accessible offline, install, and update behaviour.

The guide's animal-kind selections and do/don't instructions are configurable
through the backoffice within a versioned schema. The PWA validates and keeps
the last known compatible public revision in a guidance-only IndexedDB store for
offline use; it never executes arbitrary server-supplied workflow logic.

See [offline synchronisation](../../docs/architecture/offline-sync.md) and the
[capability ADR](../../docs/architecture/decisions/0003-capability-access.md).
