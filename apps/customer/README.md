# Customer PWA

The customer application will be a mobile-first, installable, anonymous PWA. UI
implementation is intentionally deferred until the approved Figma designs
arrive.

Its technical responsibilities are:

- an `sk-SK` UI sourced entirely from locale dictionaries;
- bounded text/media capture;
- IndexedDB draft and idempotent command queue;
- clear local-versus-server durability status;
- private signed media upload;
- case capability creation/import/removal;
- final submission and read-only sanitised status;
- accessible offline, install, and update behaviour.

See [offline synchronisation](../../docs/architecture/offline-sync.md) and the
[capability ADR](../../docs/architecture/decisions/0003-capability-access.md).
