# Backoffice PWA

The backoffice will be a desktop/tablet-oriented online PWA for individually
authenticated administrators. UI implementation is intentionally deferred until
the approved Figma designs arrive.

Its technical responsibilities are:

- enforce authenticated/TOTP-assured API access;
- present the least private data needed for queue triage;
- record auditable case transitions and restricted-data reads;
- select versioned Slovak routing/form definitions;
- let an administrator review and adjust generated content;
- confirm exact recipient and content before an idempotent dispatch;
- make retention completion, outbox failures, and security warnings visible.

There is one permission role initially, but accounts remain individual.
