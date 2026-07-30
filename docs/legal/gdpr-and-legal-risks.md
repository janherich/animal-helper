# GDPR and legal-risk briefing

Status: **working legal brief; Slovak legal review required before real data**

Last reviewed: 2026-07-30

This document applies the GDPR and selected Slovak laws to Animal Helper's
current architecture: an accountless customer PWA, an authenticated backoffice,
private report/media storage, animal-specific guidance, and administrator-
reviewed forwarding to authorities or volunteer organisations.

It is an engineering and governance checklist, not legal advice. The future
operator must have Slovak counsel confirm the conclusions, identify the actual
controller, and approve the launch documents and processing model.

## Executive conclusion

The privacy architecture is directionally strong: no reporter accounts,
capability-based access, private media, short retention, human-reviewed
dispatch, and separation of erasable content from durable events all support
data protection by design.

They do not, by themselves, make the service lawful. Before any real-data pilot,
the operator must resolve these blockers:

1. Establish the legal entity that determines the purposes and means of the
   service and is publicly identified as controller.
2. Obtain a written Slovak-law opinion on processing identifiable allegations of
   criminal animal cruelty under GDPR Article 10 and section 17 of Slovak Act
   No. 18/2018.
3. Define an Article 6 lawful basis for every purpose and any additional Article
   9 condition for special-category data that cannot be designed out.
4. Determine whether authorities and volunteer organisations are independent
   controllers, joint controllers, or processors for each transfer.
5. Complete a DPIA, legitimate-interests assessments where relevant, records of
   processing, processor/transfer reviews, and Article 13/14 transparency
   analysis.
6. Approve retention, data-subject-rights, breach, cookies/device-storage,
   children, unlawful-content, and false-report procedures.

Until item 2 is resolved, the safest product boundary is to keep non-accusatory
injured-animal guidance/rescue routing separate from suspected-crime reporting.
The latter can be handed directly to an official authority without Animal Helper
storing the allegation, or operated under a formal authority-controlled model if
counsel confirms that arrangement.

## Why GDPR applies

Animal data alone is not personal data. It becomes personal data when linked to
an identifiable owner, reporter, witness, address, vehicle, voice, image,
device, or alleged offender. “Accountless” is not the same as anonymous:

- free text, precise location, media, EXIF, voice, email, IP/risk signals, and
  provider logs may identify people;
- a random case capability is pseudonymous access control, not anonymisation;
- a coarse status or event can remain personal data when it can be linked back
  to a person or report;
- forwarding a report is a separate disclosure/processing operation even when
  the recipient is a public authority.

The GDPR protects natural persons, not animals or legal entities. Its “vital
interests” basis concerns the life or safety of a natural person; protecting an
animal is not, by itself, Article 6(1)(d). It may be relevant only in an
exceptional situation that also threatens a person.

## Data and people in scope

| Data subject                  | Likely data                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| Reporter                      | optional email, voice, images, text, location, device/network metadata, capability |
| Alleged offender/animal owner | name or indirect identity, address, image/voice, allegation, property/vehicle      |
| Witness/bystander             | image, voice, contact details, statements                                          |
| Property occupant             | exact location, home/image metadata, association with an allegation                |
| Administrator/volunteer       | identity, authentication, access/audit records, notes and actions                  |
| Authority contact             | professional contact and recipient/delivery metadata                               |
| Child reporter/depicted child | all of the above with heightened vulnerability and transparency needs              |

Data categories overlap. An image is not automatically biometric
special-category data; it becomes biometric data under Article 9 when
technically processed for unique identification. An ordinary image can still be
personal data and may reveal health, ethnicity, religion, or another
special-category characteristic. Animal Helper should not perform face
recognition, identity matching, emotion inference, or similar biometric
processing.

## Purpose and lawful-basis register

The controller must choose and document a basis before processing, not after an
incident or rights request. One broad “animal welfare” purpose is insufficient.
The table below contains candidate positions for counsel to validate, not final
legal conclusions.

| Processing purpose                            | Candidate Article 6 position                                               | Required work/limits                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Deliver public guidance and PWA               | little/no personal data; legitimate interests for necessary security logs  | minimise logs; separately analyse terminal storage under Slovak cookie rules      |
| Save and submit an injured-animal report      | likely Article 6(1)(f) legitimate interests                                | written three-part LIA: real lawful interest, necessity, and balancing/safeguards |
| Protect service against spam/abuse            | likely Article 6(1)(f); some security duties support Article 6(1)(c)       | coarse signals, short retention, false-positive route, no cross-service tracking  |
| Send requested status/service email           | legitimate interests or service/contract basis depending on approved terms | optional address, minimum content, no marketing, clear withdrawal/stop mechanism  |
| Forward a case to an authority/volunteer      | recipient- and purpose-specific basis; possibly legitimate interests       | necessity/minimisation, human review, recipient role, Article 9/10 overlay        |
| Maintain named-admin security and audit       | legal obligations plus legitimate interests                                | purpose-bound audit schema and retention; no case body in audit                   |
| Preserve data for a concrete legal claim/hold | legitimate interests; Article 9(2)(f) only where actually necessary        | case-specific authorization, scope, review/expiry; not a blanket retention basis  |
| Publish aggregate statistics                  | outside GDPR only if genuinely anonymous                                   | documented anonymisation and small-cell/re-identification assessment              |
| Product analytics or advertising              | out of scope for v1                                                        | requires new DPIA/purpose review and likely prior terminal-storage consent        |

If Article 6(1)(f) is used, the EDPB describes three cumulative conditions:
identify a lawful, precise, real and current interest; prove processing is
necessary and no equally effective less intrusive means exists; and balance it
against the person's rights, expectations, impact, and safeguards. The right to
object under Article 21 then applies.

### Consent is not a universal fix

Consent should be used only where refusal and withdrawal are genuinely possible
without undermining the requested service.

- The reporter can consent only for their own data, not for an owner, alleged
  offender, witness, or person depicted in media.
- A reporter's checkbox does not satisfy Article 10 for criminal-offence data.
- Explicit Article 9 consent must come from the person whose special-category
  data is processed.
- If withdrawal cannot realistically recall a report already delivered to an
  independent authority, consent is a poor primary basis.
- Terms acceptance, acknowledgement of a privacy notice, and GDPR consent are
  different actions and must not be presented as one checkbox.

## Launch blocker: criminal-offence allegations

Animal cruelty and neglect can be criminal offences under sections 305a and 305b
of the Slovak Criminal Code. A report that identifies or makes identifiable a
suspected person may therefore contain personal data relating to a criminal
offence.

GDPR Article 10 permits this processing only under official-authority control or
where Union/Member-State law authorizes it and provides appropriate safeguards.
Section 17 of Slovak Act No. 18/2018 also ties processing concerning criminal
guilt/convictions to a specific law or binding international treaty. This review
has not identified a clear general authorization allowing a private nonprofit to
build its own identifiable animal-cruelty allegation database.

Slovak counsel must answer:

- whether unverified reports/suspicions in this exact workflow fall within
  Article 10 and the relevant Slovak provision;
- which specific statute, if any, authorizes Animal Helper's collection,
  storage, triage, and disclosure;
- whether a contract/mandate with an official authority can put processing under
  authority control and whether Animal Helper would genuinely be its processor
  rather than a separate controller;
- required safeguards, access limits, retention, notices, and recipient rules.

Legitimate interests, public benefit, reporter consent, and nonprofit status do
not replace the Article 10 authorization requirement.

If no satisfactory basis exists, viable designs include:

1. provide guidance and contact/routing information but send suspected-crime
   reports directly to the official authority without storing their contents;
2. collect only non-accusatory rescue facts and explicitly exclude identities
   and allegations;
3. operate the relevant intake under a documented official-authority controller
   arrangement, if the authority and counsel approve it.

This decision must precede database migration and form-contract approval.

## Special-category data

Free text and media may incidentally disclose human health, disability,
ethnicity, religion, sexual orientation, union membership, or biometric data.
Article 6 is not enough: Article 9 processing also needs a valid Article 9(2)
condition.

The preferred control is avoidance:

- ask for animal condition and routing facts, not human medical/demographic
  facts;
- warn reporters not to name or film people unless genuinely necessary;
- strip metadata from normal previews and provide cropping/redaction before
  dispatch;
- do not classify faces, voices, health, ethnicity, emotion, or identity;
- quarantine unexpected sensitive content and disclose it only after necessity
  review.

Do not assume Article 9(2)(f) “legal claims” or Article 9(2)(g) “substantial
public interest” applies to every report. Each requires its own necessity and,
for paragraph (g), a suitable EU/Member-State legal basis with safeguards.

## Controller, recipient, and provider roles

The operating legal entity will ordinarily be controller for deciding to build
the intake service, what to collect, how long to retain it, and where to route
it. Open-source maintainers are not automatically controllers merely because
they wrote code; their actual influence over live processing matters.

For every authority or volunteer organisation:

- **independent controller:** likely when the recipient receives a reviewed
  report and decides under its own mandate how to investigate and retain it;
- **joint controller:** possible when both organisations jointly design the
  intake purpose and essential means; requires an Article 26 arrangement and
  publication of its essence;
- **processor:** only when the organisation acts solely on documented
  instructions for Animal Helper's purpose, not merely because a contract calls
  it a processor.

Supabase, Cloudflare/R2/Turnstile, Vercel, the email provider, monitoring,
support, and any other vendor need a data-flow-specific role assessment. For
processors, complete Article 28 agreements, verify sufficient guarantees,
identify all subprocessors, establish breach/deletion/audit terms, and prevent
providers from reusing case data for their own analytics or AI training.

An EU storage region does not prove that all access stays in the EEA. Map
support, telemetry, subprocessors, remote administration, and onward transfers.
For third-country transfers use a valid Chapter V mechanism (adequacy or Article
46 safeguards), perform the required transfer assessment, and add technical/
contractual measures where needed.

## Transparency: reporters and people named in reports

### Article 13 notice for reporters

Before the first server-side collection, a layered Slovak notice must state:

- controller identity/contact and DPO/contact point if applicable;
- each purpose and legal basis, including the exact legitimate interests;
- data categories, recipients, and when authorities become independent
  controllers;
- international transfers and how safeguards can be obtained;
- retention periods/criteria, including local drafts, staging, backups, status,
  events, audit, and provider logs;
- rights, complaint route to the Slovak supervisory authority, and how identity
  will be verified;
- which fields are optional/required and consequences of omission;
- automated decision-making/profiling, or the fact that none with legal or
  similarly significant effects occurs;
- limits of confidentiality and the fact an authority may lawfully request or
  disclose reporter information.

Do not market the service as fully anonymous. “No account required” is accurate;
“we cannot identify you” usually is not.

### Article 14 notice for third parties

Owners, alleged offenders, witnesses, and depicted people did not provide their
data to Animal Helper. Article 14 normally requires notice within one month, at
first communication, or by first disclosure, whichever rule applies.

Notifying an alleged offender may expose the reporter or undermine handling. The
Article 14(5) exceptions can apply only after a documented, fact-specific
assessment—not as a blanket “investigation” exemption. Where notice is
impossible, disproportionate, or would seriously impair the purpose, the
controller must use appropriate safeguards, including public information where
required. Counsel must define:

- when direct notice is safe and required;
- when an exception applies and who approves/records it;
- what public third-party notice and safeguards replace direct notice;
- when responsibility transfers to an authority under its own legal regime.

## Data-subject rights

The controller needs an auditable one-month workflow for access, rectification,
erasure, restriction, objection, and applicable portability requests.

Special complications for this app:

- a capability proves control of a report, not necessarily the identity of every
  person named or depicted;
- identity checks must be proportionate and must not collect more data solely to
  satisfy a request;
- access copies must protect the rights/freedoms of the reporter, witnesses, and
  other people—redaction and partial refusal need reasoned review;
- disputed allegations should be marked unverified/restricted and supplemented
  with the person's statement where appropriate, not silently rewrite event
  history;
- erasure is not absolute, but every refusal needs a specific legal ground;
- rectification/erasure/restriction may have to be communicated to recipients;
  independent authorities may retain their copy under their own law;
- a reporter-facing “delete local data” control is not a complete server-side
  rights procedure.

The system should support privileged search by internal case reference, contact
vault value, approved structured identity data, and media hash without adding a
general cross-case search UI.

## DPIA, accountability, and privacy governance

Treat a DPIA as mandatory before pilot. The combination of precise location,
media, vulnerable reporters/children, third-party allegations, possible Article
9/10 data, and disclosure to authorities is likely high risk. The Slovak
supervisory authority's Article 35(4) list also flags location-data processing
combined with another high-risk criterion. A low initial case count does not
remove the Article 35(1) high-risk test.

The DPIA must describe operations/purposes, assess necessity and
proportionality, identify risks to every affected person, and map
mitigations/evidence. Revisit it when adding a jurisdiction, media type,
analytics, AI, automated routing, recipient category, or materially different
retention. If high residual risk cannot be mitigated, Article 36 prior
consultation is required before processing.

Also required before pilot:

- Article 30 records of processing. The under-250-person exemption is not
  available where processing is non-occasional, risky, or includes Article 9/10
  data.
- Documented privacy/security policies, staff/volunteer confidentiality and role
  training, access reviews, and compliance evidence.
- A formal DPO assessment. A small nonprofit is not automatically required to
  appoint a DPO unless it is a public body or its core activities involve
  large-scale monitoring or large-scale Article 9/10 processing. A named privacy
  lead and external specialist remain prudent even if Article 37 does not
  mandate a DPO.
- A change-review gate linking product contracts, data map, DPIA, threat model,
  processor inventory, and privacy notice versions.

## Retention and anonymisation

Every period needs a purpose and evidence. “Storage is cheap,” possible future
use, and general evidentiary value are not retention grounds.

Review the current architecture in particular:

- **30-day unsubmitted drafts:** defensible only if users are told and stale
  drafts/staging media are reliably purged; consider shorter defaults.
- **Original media until handling completes:** define “complete,” recipient
  transfer, legal-claim exceptions, and who can extend it.
- **Immediate purge after closure:** privacy-positive but may conflict with a
  concrete authority request or legal claim; use narrow, approved, expiring
  holds rather than changing the default.
- **Indefinite coarse capability status:** may remain pseudonymous personal
  data. Give it a justified finite period or prove irreversible anonymisation.
- **Durable events/audit:** opaque IDs, timestamps, actor references, and rare
  combinations can remain personal data. Privacy-review every retained field and
  avoid assuming that removing names makes it anonymous.
- **Backups and provider logs:** document practical deletion delay, access
  isolation, restoration procedure, and maximum lifetime.

Anonymous statistics require a documented re-identification assessment.
Pseudonymisation, hashing, small-cell suppression, and deleting a lookup table
are useful controls but do not automatically produce anonymous data.

## Device storage, cookies, analytics, and bot protection

Section 109(8) of Slovak Act No. 452/2021 generally requires demonstrable
consent before storing information on or accessing a user's terminal, except
storage/ access whose sole purpose is message transmission or that is strictly
necessary to provide an information-society service expressly requested by the
user.

Create a terminal-storage register covering:

- service worker/Cache API assets and offline shell;
- IndexedDB guidance, draft, media, command queue, capability, and status;
- administrator authentication/security cookies;
- Turnstile or other bot-protection storage/scripts;
- error monitoring, analytics, and embedded third-party resources.

Document the purpose, provider, key/entry, lifetime, personal-data status,
strict-necessity analysis, and consent behavior for each. Core offline draft and
security storage may qualify as strictly necessary for the explicitly requested
service, but this needs a reasoned assessment. Non-essential analytics or
advertising requires prior consent; do not load it before consent and make
withdrawal as easy as acceptance.

A cookie banner is unnecessary if every item is genuinely exempt, but a clear
storage notice is still appropriate. A banner does not cure noncompliant
processors, transfers, excessive collection, or invalid GDPR legal bases.

## Children

Children may encounter injured animals and use the app. The operator should not
collect date of birth merely to avoid this issue.

- Use child-readable Slovak privacy/safety copy and conservative defaults.
- Include children's interests explicitly in the legitimate-interest balancing
  and DPIA.
- Avoid precise identity/contact data unless necessary; establish escalation
  guidance for immediate human danger.
- If any processing relies on consent for an information-society service, Slovak
  Act No. 18/2018 uses age 16 for independent child consent and requires
  parental authorization below that age.
- Parental consent from a reporter cannot authorize processing of unrelated
  third parties in a report.

Counsel should decide the minimum supported age and what happens when a young
child submits evidence involving family members or a home.

## Security and personal-data breaches

Article 32 requires security appropriate to risk and regular effectiveness
testing. The existing capability, MFA, private storage, no-log content policy,
idempotency, audit, media quarantine, and deletion controls should become tested
evidence rather than documentation alone.

For every suspected personal-data breach:

1. contain it and record awareness time, scope, effects, and remediation;
2. processors notify the controller without undue delay under contract;
3. notify the competent supervisory authority within 72 hours unless the breach
   is unlikely to risk people's rights/freedoms;
4. inform affected people without undue delay when high risk is likely, subject
   to the Article 34 exceptions;
5. document the decision even when no notification is made.

The accountless model complicates breach communication. The plan must define how
capability-only reporters are warned without exposing reports or creating a new
identity database.

## Other likely Slovak/EU legal issues

### Personality, privacy, and recordings

Sections 11–12 of the Slovak Civil Code protect dignity, privacy, names,
likenesses, and personal audio/video. A private app cannot assume that the
statutory “official use” exception available for official purposes automatically
covers its own collection and forwarding. Product controls should ask users to
focus on the animal, avoid filming unrelated people/private interiors, crop or
redact where possible, and never encourage trespass or confrontation.

### False allegations, reputation, and procedural fairness

Reports can damage reputation and may engage civil personality rights,
defamation, or knowingly false accusation rules. Keep allegations private, label
them as unverified reporter statements, preserve source/context, avoid public
naming or automated guilt scores, support restriction/response handling, and
forward only what is necessary. Terms should prohibit knowingly false or
malicious reports without intimidating good-faith reporters.

### Whistleblower claims

Slovak Act No. 54/2019 protects qualifying reports connected to employment or a
similar relationship under specified conditions. A general animal report is not
automatically a protected whistleblower disclosure. Do not promise statutory
whistleblower status, immunity, secrecy, or protection from retaliation; link
eligible users to official advice.

### Copyright and uploaded media

The reporter may own a photo/video/audio recording or may not. Terms need a
narrow license to store, validate, derive safe previews, and send media to the
reviewed recipient for the case purpose. Do not demand ownership transfer or a
broad publicity license. Provide a rights-complaint process and do not publish
uploads.

### Unsafe guidance and emergency expectations

The administered do/don't guide can affect animal and human safety. Use
qualified source/review records, revision history, exhaustive preview, emergency
rollback, contact verification, and clear scope. The app should not claim to be
a veterinarian, emergency service, police channel, or guarantee of response
unless the operator actually holds that status and capacity.

### Routing, evidence, and authority disclosure

Confirm the legal competence and current contact for each destination. Explain
that forwarding does not equal filing an official complaint unless the recipient
confirms that status. Preserve original hashes/metadata only as long as
necessary and document transformations so the app does not overstate chain of
custody or evidentiary authenticity. Establish a process for subpoenas,
police/authority requests, preservation demands, and disclosure logging.

### Illegal or dangerous content

Uploads may contain unlawful imagery, threats, intimate content, malware, or
evidence of harm to a person. Define quarantine, restricted viewing, escalation,
law-enforcement/legal review, and deletion/preservation rules before volunteers
handle real media. Do not route such content through ordinary issue trackers,
email previews, AI tools, or support chat.

### Service-provider identity and terms

Slovak Act No. 22/2004 imposes operator/contact information duties on qualifying
information-society service providers. Regardless of final applicability to a
free nonprofit service, publish the operator's legal name, address/contact,
registration details where relevant, supervisory/privacy contact, service scope,
acceptable-use rules, and complaint route. Terms must not contradict the privacy
notice or promise service levels/confidentiality the operator cannot deliver.

## Prioritised launch checklist

### Blockers before accepting any real report

- [ ] Operator/controller legal entity and accountable governance approved.
- [ ] Written Article 6/9/10 Slovak legal-basis opinion and purpose matrix.
- [ ] Rescue-only versus suspected-offence product boundary decided.
- [ ] Authority/volunteer controller-role and transfer agreements approved.
- [ ] DPIA, LIAs, RoPA, DPO assessment, and residual-risk acceptance completed.
- [ ] Slovak Article 13 notice and Article 14 decision procedure approved.
- [ ] Retention schedule, legal holds, rights workflow, and breach plan tested.
- [ ] Processor/subprocessor DPAs, transfer mechanisms, regions, and deletion
      evidence approved.
- [ ] Terminal-storage/cookie/Turnstile assessment completed.
- [ ] Terms, media license, false-report, unlawful-content, and emergency-scope
      wording approved.
- [ ] Child-use assumptions and subject-matter-reviewed guidance approved.

### Operational evidence before pilot

- [ ] Synthetic end-to-end rights, purge, backup-restore, and breach exercises.
- [ ] Admin/volunteer confidentiality, role training, and access review.
- [ ] Recipient directory provenance and misdirected-disclosure rehearsal.
- [ ] Public/support process for privacy, media-rights, and safety complaints.
- [ ] Version register for notices, purposes, vendors, DPIA, and guidance.
- [ ] Named privacy/legal incident contact with out-of-hours escalation.

### Features requiring a fresh legal/DPIA review

- analytics, advertising, or session replay;
- AI/ML classification, face/voice analysis, or automated credibility/risk
  scoring;
- automatic authority selection without administrator review;
- public case maps, feeds, searchable statistics, or media;
- reporter accounts, chat, or post-submission comments;
- new countries, languages with different recipients/laws, or non-EEA hosting;
- expanded media, longer retention, bulk export, or external research access.

## Authoritative source baseline

Checked on 2026-07-30:

- [GDPR consolidated text, including Articles 5–10, 13–14, 24–37 and 44–49](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)
- [Slovak Act No. 18/2018 on personal-data protection](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2018/18/)
- [Slovak DPA list of processing requiring a DPIA](https://dataprotection.gov.sk/sk/aktuality/zoznam-spracovatelskych-operacii-ktore-podliehaju-poziadavke-posudenie-vplyvu.html)
- [EDPB legitimate-interest summary](https://www.edpb.europa.eu/system/files/2024-10/edpb_summary_202401_legitimateinterest_en.pdf)
- [EDPB controller/processor Guidelines 07/2020](https://www.edpb.europa.eu/documents/guideline/guidelines-072020-on-the-concepts-of-controller-and-processor-in-the-gdpr_en)
- [EDPB international-transfer Recommendations 01/2020](https://www.edpb.europa.eu/documents/recommendation/recommendations-012020-on-measures-that-supplement-transfer-tools-to_en)
- [EDPB breach-notification Guidelines 9/2022](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-92022-personal-data-breach-notification-under_en)
- [Slovak Act No. 452/2021, section 109 terminal storage](https://static.slov-lex.sk/static/SK/ZZ/2021/452/20260301.print.html)
- [Slovak Criminal Code, including animal cruelty/neglect and false accusation](https://www.slov-lex.sk/ezbierky-fe/pravne-predpisy/SK/ZZ/2005/300/)
- [Slovak Civil Code, sections 11–13 personality/privacy rights](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/1964/40/)
- [Slovak whistleblower Act No. 54/2019](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2019/54/)
- [Slovak Electronic Commerce Act No. 22/2004](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2004/22/)
- [Slovak Copyright Act No. 185/2015](https://www.slov-lex.sk/ezbierky-fe/pravne-predpisy/SK/ZZ/2015/185/)

Laws, regulator guidance, service design, and vendor terms can change. Recheck
the source version and obtain counsel approval at the pilot launch date.
