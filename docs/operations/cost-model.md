# Cost model

Status: **planning estimate**

Prices checked: 2026-07-29

Currency: USD unless stated otherwise; taxes and exchange rates excluded

The architecture is intended to start near zero infrastructure cost. Free tiers
are a pilot constraint, not an availability or backup guarantee.

## Provider assumptions

| Service                              | Free/pilot allowance used by this plan                                                             | Paid trigger                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| GitHub public repository and Actions | standard hosted runners are free for public repositories                                           | private-repo minutes/storage or paid governance                                                   |
| Vercel                               | Hobby is $0 for personal, non-commercial use                                                       | Pro is $20/month; confirm eligibility when an organisation owns/deploys the project               |
| Supabase                             | Free: 500 MB database, 50,000 MAU, 1 GB storage, 500,000 Edge Function calls; no automatic backups | Pro: $25/month, 8 GB database, 100 GB storage, 7-day daily backups; Edge includes 2 million calls |
| Cloudflare R2 Standard               | 10 GB-month storage, 1 million Class A and 10 million Class B operations monthly; egress free      | $0.015/GB-month above free storage plus operation overage                                         |
| Resend                               | 3,000 emails/month and 100/day                                                                     | Pro: $20/month for 50,000 emails                                                                  |
| Domain                               | no meaningful free assumption                                                                      | roughly EUR 10–25/year depending on registrar/TLD                                                 |

Sources:

- [Vercel pricing](https://vercel.com/pricing) and
  [Vercel terms](https://vercel.com/legal/terms)
- [Supabase pricing](https://supabase.com/pricing),
  [Edge Function pricing](https://supabase.com/docs/guides/functions/pricing),
  and [runtime limits](https://supabase.com/docs/guides/functions/limits)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Resend pricing](https://resend.com/docs/knowledge-base/what-is-resend-pricing)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)

Provider prices and terms change; re-check them before approval of a pilot
budget.

## Media sensitivity

Steady-state storage estimates assume content is deleted when handling
completes:

| Scenario   | Cases/day | Average media/case | Retention | Steady media |                                      R2 storage estimate |
| ---------- | --------: | -----------------: | --------: | -----------: | -------------------------------------------------------: |
| Lean pilot |        10 |               3 MB |   30 days |      0.88 GB |                                                       $0 |
| Expected   |        30 |               4 MB |   45 days |      5.27 GB |                                                       $0 |
| Stress     |        50 |              10 MB |   90 days |     43.95 GB | about $0.51/month above the 10 GB free storage allowance |

The 20 MB hard per-case cap limits a single report, but retention duration is
the dominant cost variable. Derived previews, incomplete uploads, and storage
rounding add overhead. Lifecycle rules must remove staging objects and closed
cases.

At 50 cases/day and ten API calls per case, intake generates about 15,000
function calls/month before backoffice activity—well below the free function
allowance. The database, not function calls, is the more likely Supabase
free-tier constraint.

At two messages per case, the expected scenario uses about 1,800 emails/month
and 60/day. The stress scenario reaches the Resend daily free cap exactly before
administrator/account messages, retries, or extra recipients.

## Monthly operating scenarios

| Scenario                              | Vercel | Supabase |               R2 | Email |  Estimated monthly total |
| ------------------------------------- | -----: | -------: | ---------------: | ----: | -----------------------: |
| Development / synthetic pilot         |     $0 |       $0 |               $0 |    $0 |           $0 plus domain |
| Public pilot accepting no-backup risk |     $0 |       $0 |       usually $0 |    $0 |           $0 plus domain |
| Recommended durable baseline          |     $0 |      $25 |       usually $0 |    $0 |    about $25 plus domain |
| Organisation needs Vercel Pro         |    $20 |      $25 |       usually $0 |    $0 |    about $45 plus domain |
| Paid email also required              |    $20 |      $25 | usually under $1 |   $20 | about $65–66 plus domain |

The recommended baseline buys database backups and headroom. It does not buy a
service-level agreement for the whole multi-provider system or eliminate the
need to test restores.

## Important commercial/privacy constraints

- Vercel Hobby is described as personal, non-commercial use. Confirm continued
  eligibility before transferring the repository or deployment to an
  organisation.
- Vercel's current terms include provisions concerning use of customer content
  for AI/ML for Hobby and trial use. The architecture therefore deploys only
  public static application code/assets there; case payloads and media go
  directly to other processors. Legal review of every provider remains
  necessary.
- Supabase Free advertises no automatic backups and may pause sufficiently
  inactive projects. Daily use reduces pause likelihood but does not mitigate
  deletion/corruption risk.
- Free allowances can change or be withdrawn. Provider exit must be practical:
  standards-based static assets, PostgreSQL migrations/export, S3-compatible
  objects, and an email adapter.

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

Move from the all-free configuration when any of these occurs:

- the pilot cannot tolerate permanent database loss;
- database use approaches 400 MB;
- stored media approaches 8 GB or lifecycle deletion is not reliable;
- email approaches 80 messages/day or 2,400/month;
- an organisational repository/deployment is not eligible for Vercel Hobby;
- volunteer operations need guaranteed support, longer logs, or service-level
  commitments;
- legal/DPIA work requires a feature not present on the free tier.
