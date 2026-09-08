# Production vendor handoff — Aliancia združení na ochranu zvierat

Status: **account-opening pack for the operator; not a go-live**
Date: 2026-09-08
Audience: technically skilled person at the o.z., plus the štatutár who must own billing

Forward this as-is. It creates organisation-owned accounts, invoices, and DPAs for a later deploy. It does **not** admit real reports and does **not** make the service lawful. Counsel still confirms the o.z. as controller and the checklist in [GDPR and legal-risk briefing](../legal/gdpr-and-legal-risks.md).

---

## Slovak cover (for the štatutár)

**Prevádzkovateľom** produkčného systému má byť občianske združenie z registra, nie vývojár ako súkromná osoba.

Účel: otvoriť a zaplatiť účty **na meno o.z.** (fakturačná adresa, karta/faktúra, DPA). Vývojár neskôr ako člen s odvolateľným prístupom, nie ako vlastník účtu, domény ani fakturácie.

Kým o.z. tieto účty nevlastní, nespúšťajte ostré hlásenia.

---

## 1. Legal customer (copy into every vendor)

Source: [Register MNO, informative extract](https://ives.minv.sk/rmno/detail/13542108733578674670) dated 2026-09-08. That extract is not a document for legal acts; use an official výpis when a vendor or bank asks for one.

| Field | Value |
| --- | --- |
| Legal name | Aliancia združení na ochranu zvierat |
| Legal form | občianske združenie |
| IČO | 42268737 |
| Registered seat | Námestie SNP 463/3, 811 06 Bratislava-Staré Mesto, Slovak Republic |
| Registration number | VVS/1-900/90-40965 |
| Registering authority | Okresný úrad Bratislava |
| Date of establishment | 24 January 2013 |
| Statutory body | Ing. Martin Vician, predseda (acts independently / samostatne) |
| Stated purpose | ochrana zvierat, útulky |

Fill these if you have them (they are **not** on the public RMNO page):

| Field | Value |
| --- | --- |
| IČ DPH / VAT ID | _only if the o.z. is VAT-registered_ |
| Billing email | _organisation mailbox, not a personal Gmail_ |
| Billing phone | |
| Card / bank account in o.z. name | |

**Brand vs legal name.** The customer UI still says “Zverolinka o.z.” and `zverolinka.sk`. Contracts, invoices, registrar, privacy notice, and DPAs must use **Aliancia združení na ochranu zvierat**. Confirm with the board whether Zverolinka is only a public brand, and who already owns `zverolinka.sk`.

---

## 2. What to do

**Now:** organisation mailbox + password-manager vault the o.z. controls; open the four vendors below in the o.z. name with 2FA; štatutár (or a second board member) as Owner / Billing; accept each DPA; return the inventory in §5. Invite the developer later as a **member**, never as the only owner.

**Not yet:** public domain on unfinished apps; real reports; personal Hobby/Neon/GitHub/Brevo accounts “to transfer later”; analytics, ads, or generative AI on report data; production database copies on laptops.

Owners: predseda + one other o.z. person hold registrar, GitHub org, Vercel, Neon, Brevo, 2FA backup codes, and the vault master. If the developer leaves, the o.z. must still log in, rotate keys, and keep the domain.

---

## 3. Open these services

Four production vendors: **Vercel Pro**, **Neon**, **Brevo**, and a **domain**. Plus GitHub for source. Prices are estimates from [cost-model.md](cost-model.md) (2026-09-08, USD, tax extra). Prefer invoices in the o.z. name. Do not open extra hosts for media, bots, or the API.

### Prerequisites

| Item | What to create |
| --- | --- |
| Organisation mailbox | e.g. `it@…` / `ops@…` — recovery email for every vendor |
| Password manager | Bitwarden org or 1Password Business; vault `Animal Helper production` |
| Payment | Card or invoicing in IČO 42268737; a second person who can still pay |

### Domain

Buy or confirm the production domain in the o.z. name (likely `zverolinka.sk` if already owned). For `.sk`, SK-NIC registrars typically need IČO. Keep registrar login with the o.z. Point DNS at **Vercel** when the apps exist — not before.

### GitHub organisation

[Create an organisation](https://github.com/organizations/plan) (not a personal user). Display name `Aliancia združení na ochranu zvierat`; require 2FA; two o.z. Owners. Later transfer `janherich/animal-helper` into it (org owner must accept). [GitHub for Nonprofits](https://github.com/nonprofit) is optional. No Enterprise for v1.

### Vercel Pro

[vercel.com](https://vercel.com) → **Team**, plan **Pro** (~USD 20/month + usage). Not Hobby.

This one account hosts the static PWAs, command API (Functions), private media (Blob), and background jobs (Queues). Report content **will** transit Vercel; treat it as a processor, not a CDN.

- Billing: legal name, Bratislava seat, IČO 42268737, IČ DPH if you have one.
- Pin Functions to **`fra1`**. Create a **private Blob** store in **`fra1`** (region locked at create). Enable **Queues** (public beta — confirm DPA coverage with counsel).
- Hard monthly spend cap and alerts at 50% / 80% / 100%.
- Accept the DPA; disable AI / training products; no public Blob; no Vercel Postgres (Neon is the database). Large files use signed Blob uploads, not function bodies.

### Neon

[neon.com](https://neon.com) organisation/project owned by the o.z. Region **`aws-eu-central-1` (Frankfurt) preferred**, or `aws-eu-west-2` (London) — **cannot change later**. **Launch** (or higher) for a usable restore window; Free is ~6 hours restore and only if the board explicitly accepts that. Project e.g. `animal-helper-prod`. Create an **application role** (not the owner password). Accept Neon/Databricks DPA before real reports. Note pooled vs direct hostnames for later (`DATABASE_URL` pooled, `DATABASE_MIGRATION_URL` direct) — vault only, never chat or email.

### Brevo

[brevo.com](https://www.brevo.com) organisation account. Transactional plan for a few thousand messages/month — not a marketing bundle. Authenticate the sending domain (SPF, DKIM, DMARC) on the domain above. [Accept the DPA](https://help.brevo.com/hc/en-us/articles/15403782599570-Where-can-I-find-the-Data-Processing-Agreement-DPA) before anything that is not a test to o.z. inboxes. No reporter addresses on marketing lists; no personal Gmail as From.

### Pilot envelope (not a quote)

| Item | Typical pilot |
| --- | --- |
| Domain | ~EUR 10–25 / year |
| Vercel Pro | ~USD 20 / month plus small function / Blob / queue usage |
| Neon Launch | usage; modest always-on compute + 7-day restore |
| Brevo transactional | free or low tens of USD / month |
| Password manager | often a few EUR / user / month |

---

## 4. Opening checklist (every vendor)

Repeat for GitHub, Vercel, Neon, Brevo, registrar:

1. Organisation mailbox; legal name; seat Námestie SNP 463/3, 811 06 Bratislava-Staré Mesto; IČO **42268737**.
2. Payment in the o.z. name. 2FA on; backup codes in the vault. Second o.z. Owner before inviting outsiders.
3. Accept DPA; save PDF + subprocessors as `YYYY-MM-DD-vendor-dpa.pdf`. Turn off AI-training / marketing-data-sharing toggles.
4. Do **not** invite the developer until Owners and billing work.

---

## 5. Send this inventory back

**Do not paste secrets, connection strings, or API tokens into email.** Share those only via the password manager after Owners exist.

| Item | Value |
| --- | --- |
| GitHub org URL + Owners | |
| Production domain + registrar | |
| Vercel team, Pro, `fra1`, private Blob in `fra1`, Queues, spend cap, AI off | |
| Neon org + project + region + plan | |
| Brevo org + plan + sending domain | |
| DPA dates: Vercel, Neon, Brevo | |
| Vault name + organisation mailbox | |
| Second Owner confirmed (yes/no) | |
| Zverolinka is a brand of this o.z. (yes/no/unclear) | |

---

## 6. After accounts exist (developer, not this pack)

On **your** accounts, as a member: transfer the repo; connect Vercel (PWAs + Functions in `fra1`); inject Neon / Blob / Brevo secrets from the vault; migrate Neon; finish signed Blob uploads, Queues, and mail; attach the domain. Synthetic smoke tests only.

Real personal data stays blocked until counsel signs off the GDPR launch checklist. Cruelty-allegation storage is a separate legal blocker.

Keep with this pack: official MNO výpis; [cost model](cost-model.md); [persistence](persistence.md); [hosting boundaries](../architecture/decisions/0004-hosting-boundaries.md); [GDPR briefing](../legal/gdpr-and-legal-risks.md).

https://ives.minv.sk/rmno/detail/13542108733578674670
