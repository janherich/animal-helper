# Technical delivery plan

This plan deliberately leaves product flow and visual design to the responsible
team. Each phase ends with a usable technical capability and an explicit gate.

## Phase 0 — foundation

- [x] monorepo conventions, pinned runtime, lint/type/test/build checks;
- [x] architecture decisions, data lifecycle, threat model, and cost model;
- [x] initial pure event-stream primitive;
- [ ] repository governance, code of conduct, ownership, and licence
      confirmation;
- [x] private vulnerability reporting enabled on GitHub.

Gate: maintainers accept the foundational ADRs and an operator is identified.

## Phase 1 — data and platform spike

- define versioned command/event contracts with synthetic fixtures;
- implement the first case aggregate from the team's approved state diagram;
- write PostgreSQL event-store, projection, capability, audit, and outbox
  migrations;
- prove atomic append/project/outbox behaviour and idempotent retries;
- prove a signed R2 upload, server validation, and orphan cleanup;
- implement administrator invite/allow-list and mandatory TOTP;
- add local Supabase development and isolated integration tests;
- exercise projection rebuild and private-data purge.

Gate: threat-model controls AH-SEC-001 through AH-SEC-019 are tested or tracked
with an owner and deadline; no real personal data is used.

## Phase 2 — customer PWA

- integrate approved Figma screens using accessible, responsive components;
- implement the `sk-SK` dictionary with professional language review;
- implement IndexedDB draft and command queue;
- add offline/install/update behaviour and clear durability states;
- add bounded capture, upload, final submission, and status capability import;
- test on supported iOS Safari and Android Chrome devices;
- complete Slovak privacy notice integration and consent/lawful-basis UX as
  advised.

Gate: offline/retry test matrix passes, accessibility review passes, DPIA and
legal launch checklist are approved.

## Phase 3 — backoffice and dispatch

- implement queue/detail projections and audited restricted-data reads;
- add Slovak authority directory and routing data from authoritative sources;
- implement versioned form snapshots and administrator review;
- add transactional email dispatch, SPF/DKIM/DMARC, retry, and delivery
  visibility;
- implement case completion and verified private-data purge;
- rehearse account revocation, provider outage, and misdirected-email incidents.

Gate: pilot administrators complete scenario-based acceptance and security
tests.

## Phase 4 — controlled pilot

- configure production domains, budgets, quotas, alerts, and processor
  agreements;
- use synthetic smoke tests before admitting real cases;
- start with conservative case/media limits and a named on-call contact;
- review costs, abuse signals, delivery success, retention, and user support
  weekly;
- decide whether free-tier backup risk remains acceptable.

Gate: written pilot review determines changes needed before broader
availability.

## Deferred until evidence requires it

- reporter accounts or interactive post-submission conversation;
- multiple administrator roles;
- generic workflow/configuration engine;
- real-time subscriptions;
- full-text cross-case search;
- machine-learning classification or automated authority selection;
- native mobile applications;
- service decomposition.
