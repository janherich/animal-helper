# ADR 0005: Separate locale from jurisdiction

- Status: Accepted
- Date: 2026-07-29

## Context

The first UI language is Slovak and the first operating country is Slovakia.
Language, applicable authorities, official forms, and legal notices change for
different reasons and at different times.

## Decision

Keep:

- static application chrome, validation, and accessibility translations in
  package locale dictionaries keyed by stable semantic IDs;
- administrator-managed public guidance copy in immutable, locale-scoped
  revisions keyed by code-owned semantic slots;
- authority directories, routing rules, field mappings, and form templates in
  versioned jurisdiction packs;
- workflow semantics in the domain package.

The initial identifiers are locale `sk-SK` and jurisdiction `SK`. Dates, times,
numbers, plural forms, and accessibility text use locale-aware APIs. No
user-visible string is embedded in a component or domain event. Dynamic guidance
content remains language data: jurisdiction-specific revisions may select
different advice or contact references, but they do not merge locale and country
into one identifier.

Every generated document records jurisdiction-pack version, template version,
source case version, administrator edits, recipient snapshot, and delivery
outcome.

## Consequences

A country may support multiple languages, and Slovak may be used outside one
routing configuration. Official-form updates can be audited without redeploying
unrelated UI once safe configuration delivery exists. Guidance wording can also
be corrected without an application deployment while retaining the same locale
boundary and stable semantic keys.
