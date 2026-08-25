# Customer PWA

The customer application is a mobile-first, installable, anonymous Vue 3 + Vite
PWA. Screens follow approved Figma work; writes go through
`@animal-helper/client` and versioned commands. See
[ADR 0007](../../docs/architecture/decisions/0007-vue-static-pwas.md).

Its technical responsibilities are:

- `sk-SK` application chrome sourced from locale dictionaries, with
  administrator-managed advice from a locale-scoped published revision;
- a fixed-screen injured-animal guidance flow driven by the active compatible
  public guidance revision;
- bounded text/media capture;
- IndexedDB draft and idempotent command queue;
- clear local-versus-server durability status;
- private signed media upload;
- case capability creation/import/removal;
- final submission and read-only sanitised status;
- accessible offline, install, and update behaviour.

The guide's animal-kind selections and do/don't instructions are configurable
through the backoffice within a versioned schema. The PWA validates and keeps
the last known compatible public revision in a guidance-only IndexedDB store for
offline use; it never executes arbitrary server-supplied workflow logic.

See [offline synchronisation](../../docs/architecture/offline-sync.md) and the
[capability ADR](../../docs/architecture/decisions/0003-capability-access.md).
