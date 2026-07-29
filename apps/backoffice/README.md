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
- edit, preview, publish, and roll back the fixed-schema customer guidance
  matrix (animal kinds × do/don't instruction items);
- display guidance provenance/review state and compatibility with customer flow
  schema versions;
- confirm exact recipient and content before an idempotent dispatch;
- make retention completion, outbox failures, and security warnings visible.

There is one permission role initially, but accounts remain individual. Guidance
publication is an authenticated, TOTP-assured, audited operation; the editor
cannot create arbitrary screens, branches, HTML, or executable rules.
