# ADR 0006: Fixed-schema, versioned guidance flow

- Status: Proposed
- Date: 2026-07-30

## Context

The accountless customer PWA needs to guide a person through a small,
multi-screen process. The sequence and options are fixed, but advice must be
maintainable by administrators as animal-specific do/don't guidance changes. The
system also needs to work offline and must not turn a safety-sensitive customer
experience into an arbitrary client-executed workflow.

## Decision

Implement the guide as versioned, public configuration constrained by a
code-owned flow schema:

- screens, options, instruction slots, and allowed transitions are stable
  contract keys;
- a normalized animal-kind × instruction-item matrix controls applicability,
  ordering, and bounded plain-text overrides;
- static application copy stays in package locale dictionaries, while editable
  guidance copy uses locale-scoped revisions with fixed semantic slots;
- locale, jurisdiction, and flow-schema version scope the active publication so
  old installed clients continue to receive compatible content;
- typed contact actions resolve against a pinned jurisdiction-pack version and
  are snapshotted into the immutable public projection;
- drafts are edited and previewed in the authenticated backoffice, validated by
  the API, and published as immutable revisions;
- publishable revisions record content provenance/review metadata, and
  validation rejects unresolved or contradictory matrix outcomes;
- the customer PWA consumes only an active compatible revision, validates its
  schema/hash, and stores the last valid public revision in a separate IndexedDB
  store for offline use;
- publication, rollback, and edits are attributable audit actions; the guide is
  not part of the case event stream and is not a generic workflow engine.

## Consequences

Administrators can update operational guidance without a frontend deployment,
and a case can refer to the exact revision used. The finite client contract
keeps rendering, accessibility, offline behaviour, and testing manageable.
Content authors cannot add a genuinely new screen or branch without a product
and application release. That is intentional: schema changes require a reviewed
compatibility update rather than an unbounded configuration feature.

Public content needs its own cache/update and rollback handling, and the
backoffice must validate the full resolved matrix rather than only individual
cells. Multiple schema-version publications may coexist during a client
compatibility window. If guide answers are retained for triage, they are
erasable private case data; only the non-sensitive revision identifier needs
durable event metadata. A future need for arbitrary branching requires a new ADR
based on real flows and safety evidence.
