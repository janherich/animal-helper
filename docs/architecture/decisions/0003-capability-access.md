# ADR 0003: Anonymous capability access

- Status: Accepted
- Date: 2026-07-29

## Context

Reporters must not need accounts. They need draft access before submission and
status access from the same or another device afterwards.

## Decision

Use a client-generated random bearer capability of at least 256 bits. Persist
only a slow or keyed cryptographic hash server-side and compare in constant
time.

The capability authorises draft mutation until submission or 30-day expiry. It
then authorises only a sanitised status query indefinitely. It never authorises
retrieval of submitted case contents.

Transfer links put the capability in the URL fragment. The PWA imports it into
IndexedDB and strips the fragment immediately. Capabilities are excluded from
logs, telemetry, error reports, referrers, browser cache, and email-provider
tracking.

## Consequences

There are no passwords, recovery flows, or hidden user profiles. Anyone holding
the capability has its limited authority. A lost capability is not recoverable;
the interface must explain this clearly.
