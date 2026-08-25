# ADR 0007: Vue static PWAs over a shared command client

- Status: Accepted
- Date: 2026-08-25

## Context

The customer and backoffice applications are screen walkers over a durable,
event-sourced case process. Screens come from approved Figma work; writes are
already versioned commands and private-record payloads. The implementing
colleague is proficient in Vue. Volunteer maintainability ranks above cost and
performance. ADR 0004 already requires static assets on the public host and
direct API/object-store traffic for report data.

A meta-framework (Nuxt, Next) would pull server rendering and host-runtime
coupling that this architecture does not need. Two different UI frameworks
would duplicate the customer guidance renderer that the backoffice must
preview.

## Decision

Implement `apps/customer` and `apps/backoffice` as Vue 3 + TypeScript + Vite
static SPAs, installable as PWAs.

- Do not use Nuxt, Next, or any server-rendered/host-function UI. The service
  worker caches versioned application assets and a minimal offline shell only.
- Use the same Vue runtime in both apps so the backoffice previews the customer
  guidance flow with the same renderer.
- Keep views thin: a screen projects local draft or query state and issues a
  command. Vue does not own durability, retries, or case transitions.
- Put capability create/import, the IndexedDB draft and command queue,
  `expectedVersion` reconciliation, and contract parsing in a framework-free
  TypeScript package. Both PWAs depend on that package.
- Treat `@animal-helper/contracts` as the write schema. Do not introduce a
  second client field model or a form library that retries HTTP on its own.
- Do not add a generic form builder or client-executed workflow engine. Flow
  topology stays in application code (ADR 0006).
- Keep the frontend dependency set small: Vue, Vue Router, the PWA plugin, and
  locale wiring. Ephemeral chrome state may use Pinia; case and queue state
  must not.

## Consequences

Frontend work can start from a fixed stack without reopening React versus Vue.
Contributors who only know React can still work in the shared TypeScript
packages and contracts. Replacing Vue later is possible if views stay thin;
replacing the command client is not a UI rewrite.

The main risk is later pressure to adopt Nuxt for convenience. That requires a
new ADR and would have to preserve the static-host and capability-fragment
boundaries. A large component library is acceptable only if it does not embed
arbitrary HTML or weaken CSP.
