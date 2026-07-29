# Security requirements

Status: **baseline for implementation**

Scope: customer PWA, backoffice PWA, API, database, media, email, CI/CD

`MUST` requirements block a pilot with real reports. `SHOULD` requirements
require a recorded risk acceptance if deferred. Requirement IDs are stable and
should be referenced from issues and tests.

## Boundaries and transport

- **AH-SEC-001 — MUST:** All production traffic uses HTTPS. Enable HSTS after
  domain validation and redirect HTTP without reflecting sensitive URL
  fragments.
- **AH-SEC-002 — MUST:** The API permits exact production/preview origins
  through an allow-list. It never combines wildcard CORS with credentials.
- **AH-SEC-003 — MUST:** Secrets exist only in provider secret stores or local
  ignored environment files. Browser bundles contain only explicitly public
  identifiers. Service-role/database/object-signing/email keys never reach a
  PWA.
- **AH-SEC-004 — MUST:** Production and preview use distinct projects, buckets,
  credentials, domains, and recipient restrictions. Preview never receives
  production data.

## Anonymous capabilities and commands

- **AH-SEC-005 — MUST:** Case capabilities have at least 256 bits from a
  cryptographically secure random source. Store only a keyed or slow hash and
  compare proofs without timing-dependent early exit.
- **AH-SEC-006 — MUST:** A capability has server-enforced scope and lifetime:
  bounded draft mutation until submission/30 days, then sanitised status read
  only.
- **AH-SEC-007 — MUST:** Capabilities never appear in HTTP query strings, logs,
  telemetry, exception reports, analytics, referrers, or email click-tracking.
  Transfer links use a fragment that the PWA removes immediately after import.
- **AH-SEC-008 — MUST:** Every mutating command has an unguessable idempotency
  ID, canonical content hash, expected stream version, and authenticated scope.
  Duplicate IDs cannot produce duplicate effects.
- **AH-SEC-009 — MUST:** Status responses are constant in shape for invalid,
  expired, and unknown capabilities where practical, rate-limited,
  non-indexable, and contain no private case content.

## Administrator access

- **AH-SEC-010 — MUST:** There is no public administrator sign-up. Accounts are
  named and allow-listed; shared accounts are prohibited.
- **AH-SEC-011 — MUST:** TOTP multi-factor authentication and the expected
  authentication assurance level are checked server-side on every restricted
  endpoint.
- **AH-SEC-012 — MUST:** Sessions have short inactivity and bounded absolute
  lifetimes, rotate after authentication, can be centrally revoked, and do not
  use persistent browser local storage for bearer tokens.
- **AH-SEC-013 — MUST:** Every endpoint performs object-level authorisation.
  Client routing, hidden buttons, and database row-level security are not
  substitutes.
- **AH-SEC-014 — MUST:** Restricted-data reads, mutations, exports, recipient
  changes, generated documents, sends, retention overrides, account changes, and
  failed access attempts create tamper-resistant audit metadata.
- **AH-SEC-015 — SHOULD:** Alert on unusual download/export volume, repeated
  failed MFA, access from a new environment, recipient overrides, and disabled
  retention jobs.

## Input and media

- **AH-SEC-016 — MUST:** Validate every request against a versioned allow-list
  schema with strict length, count, numeric, and enum bounds. Use parameterised
  database operations. The domain never consumes raw request objects.
- **AH-SEC-017 — MUST:** Reporter/admin text is rendered as text, not HTML. Rich
  text, SVG, embedded documents, and arbitrary remote URLs are prohibited in the
  initial release.
- **AH-SEC-018 — MUST:** Media uploads use single-object, short-lived signed
  URLs tied to case, key, declared type, and size. Buckets are private and
  listing is denied.
- **AH-SEC-019 — MUST:** Server-side validation checks byte length, magic bytes,
  allowed format/codec, media duration where relevant, and confirmed object
  hash. Filenames and client MIME types are not trusted.
- **AH-SEC-020 — MUST:** Originals are never served inline from their upload
  location. Administrator viewing uses short-lived reads and safe derived
  previews; risky downloads use attachment disposition and explicit warning.
- **AH-SEC-021 — MUST:** Unconfirmed uploads expire, per-case total media is
  capped at 20 MB, voice is capped at 30 seconds, and global/account/network
  abuse quotas are server-enforced.
- **AH-SEC-022 — SHOULD:** Scan supported media for malware and decompression
  hazards before normal administrator access. Quarantine or manual-safe-download
  procedures cover scanner failure.

## Browser applications

- **AH-SEC-023 — MUST:** Both PWAs set a restrictive Content Security Policy and
  do not load third-party scripts on pages handling case/admin state. Avoid
  inline script, dynamic HTML insertion, and unbounded postMessage listeners.
- **AH-SEC-024 — MUST:** The service worker caches only allow-listed static
  assets. It never caches API responses, private media, signed URLs, contact
  data, or capabilities and has a tested upgrade/rollback strategy.
- **AH-SEC-025 — MUST:** Sensitive responses use `Cache-Control: no-store`,
  `X-Content-Type-Options: nosniff`, appropriate frame restrictions, a
  restrictive referrer policy, and no search indexing.
- **AH-SEC-026 — MUST:** Cookie-authenticated endpoints enforce SameSite,
  origin/referer validation, and anti-CSRF tokens for unsafe methods. If bearer
  headers are used, tokens remain in memory and equivalent origin controls
  apply.

## Data, privacy, and integrity

- **AH-SEC-027 — MUST:** Direct personal data, free text, exact location, media,
  message/document contents, and capabilities are absent from event payloads,
  audit details, logs, traces, metrics, test fixtures, and support tools.
- **AH-SEC-028 — MUST:** Private data is encrypted in transit and by storage
  providers at rest. Highly sensitive application secrets and transient outbox
  content use application-level envelope encryption where the threat analysis
  requires it, with keys separate from ciphertext.
- **AH-SEC-029 — MUST:** Event append, synchronous projection updates, and
  outbox insertions are one transaction. Database constraints reject duplicate
  commands and event versions.
- **AH-SEC-030 — MUST:** The configured deletion workflow removes private
  records, originals, derived media, contact data, document snapshots, and
  transient messages, while retaining only the approved sanitised
  status/event/audit facts.
- **AH-SEC-031 — MUST:** Production logging is field allow-listed and redacts
  authorisation headers and provider errors. Retention is the shortest supported
  period, with 30 days as the initial maximum target.
- **AH-SEC-032 — MUST:** Public statistics suppress small cells and combinations
  that could identify a reporter, location, animal owner, administrator, or
  case.

## Email and external routing

- **AH-SEC-033 — MUST:** Administrators review the rendered content and exact
  recipient immediately before dispatch. Initial recipients come from a
  maintained allow-listed directory; overrides require confirmation and audit.
- **AH-SEC-034 — MUST:** Outbound sends have idempotency keys and a
  transactional outbox. Retries cannot send a second message after an ambiguous
  provider result without reconciliation.
- **AH-SEC-035 — MUST:** Configure SPF, DKIM, DMARC, provider tracking off, and
  minimum-content reporter emails. A capability email contains no case
  allegation, location, animal details, or media.
- **AH-SEC-036 — SHOULD:** Protect attached/generated documents with an approved
  secure-delivery method when recipient capability permits; otherwise document
  the residual email risk and minimise content.

## Availability, abuse, and operations

- **AH-SEC-037 — MUST:** Layer limits by capability, case, administrator, coarse
  network signal, and global provider budget. Use a privacy-preserving bot
  challenge when risk thresholds are exceeded, not as the sole control.
- **AH-SEC-038 — MUST:** Quotas and spend alerts cover API invocations, database
  size, object storage/operations, email, and static hosting. Failure degrades
  to a clear queued/offline state, not silent data loss.
- **AH-SEC-039 — MUST:** Outbox, deletion, upload-cleanup, and projection
  failures are retried with bounded backoff and alerted after a defined age.
- **AH-SEC-040 — SHOULD:** Maintain and test encrypted backups with a documented
  restore objective before moving beyond a constrained pilot. If the free tier
  has no backups, record the accepted permanent-loss risk visibly.
- **AH-SEC-041 — MUST:** A private incident channel, account/key revocation
  procedure, breach assessment process, and provider contact list exist before
  accepting real data.

## Software supply chain

- **AH-SEC-042 — MUST:** Commit an exact lockfile, pin runtime/package-manager
  versions, minimise dependencies, and review install scripts and new
  maintainers for security-sensitive packages.
- **AH-SEC-043 — MUST:** CI has read-only permissions by default, uses no
  production data, and gives deployment environments the narrowest secrets. Pin
  third-party actions to reviewed commit SHAs before production deployment.
- **AH-SEC-044 — MUST:** Dependency/security updates run regularly. A known
  exploitable critical vulnerability blocks deployment or has a dated,
  documented mitigation.
- **AH-SEC-045 — MUST:** Secrets and private data scanning run before
  production; exposed credentials are rotated, not merely removed from Git
  history.

## Verification

Every `MUST` needs automated evidence where possible and a manual runbook check
where not. The release checklist maps each requirement to:

- implementation location;
- automated test or configuration evidence;
- responsible maintainer;
- last verification date;
- any time-bounded risk acceptance.
