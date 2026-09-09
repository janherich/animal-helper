# Cost model

Status: **planning estimate**

Prices checked: 2026-09-08

Currency: USD unless stated otherwise; taxes and exchange rates excluded

The architecture is intended to keep a small, organisation-owned vendor set.
Free tiers (especially Neon restore) are a pilot constraint, not an availability
or backup guarantee.

## Provider assumptions

| Service                              | Free/pilot allowance used by this plan                                                        | Paid trigger                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| GitHub public repository and Actions | standard hosted runners are free for public repositories                                      | private-repo minutes/storage or paid governance                                       |
| Vercel Pro                           | Organisation team: static PWAs, Functions (`fra1`), private Blob, Queues (~$20/month + usage) | Spend alerts; do not use Hobby                                                        |
| Neon PostgreSQL                      | Free: 0.5 GB storage, 100 CU-hours/project, 6-hour restore, scale-to-zero; no SLA             | Launch: usage-based compute/storage, 7-day restore; Scale adds SLA/compliance options |
| Email adapter (Brevo)                | Transactional plan covering a few thousand messages/month                                     | Paid plan if volume or a dedicated IP is required                                     |
| Domain                               | no meaningful free assumption                                                                 | roughly EUR 10–25/year depending on registrar/TLD                                     |

Sources:

- [Vercel pricing](https://vercel.com/pricing),
  [Frankfurt regional pricing](https://vercel.com/docs/pricing/regional-pricing/fra1),
  [Vercel Blob](https://vercel.com/docs/vercel-blob),
  [Vercel Queues](https://vercel.com/docs/queues), and
  [Vercel terms](https://vercel.com/legal/terms)
- [Neon plans](https://neon.com/docs/introduction/plans) and
  [Neon regions](https://neon.com/docs/introduction/regions)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

Provider prices and terms change; re-check them before approval of a pilot
budget.

## Media sensitivity

Steady-state storage estimates assume content is deleted when handling
completes:

| Scenario   | Cases/day | Average media/case | Retention | Steady media | Blob storage estimate (fra1, storage only) |
| ---------- | --------: | -----------------: | --------: | -----------: | -----------------------------------------: |
| Lean pilot |        10 |               3 MB |   30 days |      0.88 GB |                                     ~$0.02 |
| Expected   |        30 |               4 MB |   45 days |      5.27 GB |                                     ~$0.13 |
| Stress     |        50 |              10 MB |   90 days |     43.95 GB |                                     ~$1.10 |

The 20 MB hard per-case cap limits a single report, but retention duration is
the dominant cost variable. Derived previews, incomplete uploads, and storage
rounding add overhead. Lifecycle rules must remove staging objects and closed
cases.

At 50 cases/day and ten API calls per case, intake generates about 15,000
requests/month before backoffice activity. The database size and restore window,
not request count, are the more likely Neon constraints. Blob operations and
function/queue usage add to the Vercel invoice but stay small at pilot volume
compared with the Pro base fee.

At two messages per case, the expected scenario uses about 1,800 emails/month
and 60/day. Size the Brevo transactional plan against that plus admin messages
and retries.

## Monthly operating scenarios

| Scenario                                | Vercel |         Neon | Email | Estimated monthly total     |
| --------------------------------------- | -----: | -----------: | ----: | --------------------------- |
| Development / synthetic (local only)    |     $0 |           $0 |    $0 | $0                          |
| Public pilot on Pro, short Neon restore |   $20+ |           $0 |    $0 | Vercel Pro plus domain      |
| Recommended durable baseline            |   $20+ | Launch usage |    $0 | Vercel Pro plus Neon Launch |
| Paid email also required                |   $20+ | Launch usage |   $20 | plus Brevo paid plan        |

Local development uses Docker and does not need a hosted database. The
recommended production baseline buys a longer Neon restore window and paid
compute/storage. It does not buy a service-level agreement for the whole
multi-provider system or eliminate the need to test restores. Re-check Neon
CU-hour and storage rates before approving a budget; always-on compute is the
usual paid driver.

## Important commercial/privacy constraints

- Production uses **Vercel Pro** on an organisation team. Hobby is personal /
  non-commercial and is not the operator account.
- Vercel Functions, Blob, and Queues process report metadata and media. Accept
  the DPA, pin Functions and the Blob store to `fra1`, disable AI/training
  products, and treat Vercel as a processor in the RoPA.
- Large files use signed Blob uploads. Function payload limits are not an upload
  path.
- Neon Free advertises a 6-hour restore window, 0.5 GB storage, and scale-to
  zero. Daily use reduces cold starts but does not replace a tested restore.
  Create the project in an EU region; the region cannot be changed later.
- Blob store region also cannot be changed after creation.
- Vercel Queues is a public-beta product; re-check availability, regional
  pricing, and DPA coverage before relying on it for purge/outbox.
- Free allowances can change or be withdrawn. Provider exit must stay practical:
  static assets, PostgreSQL migrations/export, Blob/S3-compatible objects, and
  an email adapter.

## Cost controls

Before admitting real data:

- set provider budgets/alerts at 50%, 80%, and 100% of the agreed monthly
  ceiling;
- cap case media, file count, staging lifetime, and API request bodies
  server-side;
- enforce global intake and email circuit breakers with an administrator-visible
  reason;
- disable arbitrary recipients and bulk export;
- monitor database, object storage, function invocation, and email trends
  weekly;
- use no paid observability/analytics vendor initially;
- review actual average media size and handling time after the first 100 cases.

## Upgrade triggers

Move off Neon Free or raise the Vercel spend cap when any of these occurs:

- the pilot cannot tolerate a 6-hour restore window;
- database use approaches 400 MB;
- stored media approaches 8 GB or lifecycle deletion is not reliable;
- email approaches 80 messages/day or 2,400/month;
- Vercel Pro usage (functions, Blob, queues) approaches the board spend cap;
- an extra bot-protection vendor is required after abuse evidence;
- volunteer operations need guaranteed support, longer logs, or service-level
  commitments;
- legal/DPIA work requires a feature not present on the free tier.
