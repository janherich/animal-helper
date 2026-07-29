# ADR 0005: Separate locale from jurisdiction

- Status: Accepted
- Date: 2026-07-29

## Context

The first UI language is Slovak and the first operating country is Slovakia.
Language, applicable authorities, official forms, and legal notices change for
different reasons and at different times.

## Decision

Keep:

- user-visible translations in locale dictionaries keyed by stable semantic IDs;
- authority directories, routing rules, field mappings, and form templates in
  versioned jurisdiction packs;
- workflow semantics in the domain package.

The initial identifiers are locale `sk-SK` and jurisdiction `SK`. Dates, times,
numbers, plural forms, and accessibility text use locale-aware APIs. No
user-visible string is embedded in a component or domain event.

Every generated document records jurisdiction-pack version, template version,
source case version, administrator edits, recipient snapshot, and delivery
outcome.

## Consequences

A country may support multiple languages, and Slovak may be used outside one
routing configuration. Official-form updates can be audited without redeploying
unrelated UI once safe configuration delivery exists.
