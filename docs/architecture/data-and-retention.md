# Data classification and lifecycle

Status: **proposed baseline; legal review required before real data**

Anonymous reporting does not mean anonymous data. Free text, images, voices,
locations, network metadata, and allegations may identify reporters or other
people. Allegations can also involve data relating to offences, which requires
specific GDPR analysis.

## Classification

| Class        | Examples                                                                                      | Default handling                                                |
| ------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Restricted   | report text, exact location, media, email, capability, generated forms, outbound message body | encrypted in transit/at rest, narrowly authorised, never logged |
| Confidential | administrator identity, audit records, recipient directory, delivery metadata                 | authenticated administrator/API access                          |
| Internal     | event metadata, coarse operational metrics, non-sensitive configuration                       | service/team access                                             |
| Public       | PWA assets, published guidance, documentation, deliberately sanitised aggregate statistics    | public                                                          |

The permanent capability status is a restricted endpoint even though its
response is deliberately sparse.

## Logical separation

- Event store: durable facts with privacy-reviewed payloads and opaque
  references.
- Private case data: erasable structured fields and text.
- Contact vault: optional reporter email stored separately from case content.
- Media bucket: private originals and derived previews under opaque keys.
- Status projection: coarse state only.
- Analytics projection: non-identifying aggregates with small-cell suppression.
- Guidance store: drafts and immutable published revisions; only the active,
  compatible projection is public.
- Outbox: encrypted transient message material, deleted after terminal delivery
  plus a short operational window.
- Audit log: administrator/action metadata, no report body or capability.

Application code must not create joins or exports that defeat this separation
without an explicit, audited administrator operation.

## Default lifecycle

| Data                                           | Retention target                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Unsubmitted local draft                        | controlled by reporter; local warning before 30 days                           |
| Unsubmitted server draft and staging media     | delete at 30 days                                                              |
| Submitted private case data and original media | until handling is complete                                                     |
| Closed-case private data                       | purge job starts immediately; complete within 24 hours                         |
| Optional email address                         | delete with private case data, or earlier after the last required notification |
| Transient outbox message body                  | delete after terminal delivery and short retry/debug window                    |
| Coarse status projection                       | indefinite                                                                     |
| Non-identifying aggregate statistics           | indefinite                                                                     |
| Published/withdrawn guidance revisions         | indefinite for provenance and incident reconstruction                          |
| Security audit metadata                        | policy to be set by legal/security review                                      |
| Provider/system logs                           | minimum supported duration, target 30 days or less                             |

An exceptional legal hold must record a reason, scope, authorising
administrator, expiry/review date, and audit event. It is not a generic “keep”
checkbox.

Deletion is a workflow with retries and evidence:

1. mark private records pending deletion and deny normal reads;
2. delete original and derived objects;
3. delete contact, text, form snapshot, and message material;
4. replace private references with tombstones;
5. record completion metadata without deleted values;
6. alert on incomplete work.

Backups, replicas, provider logs, and failed outbox entries must be included in
the retention analysis before production. If a backup cannot delete one record,
its short lifetime and access controls become part of the documented policy.

## GDPR work required before pilot

The future operator must document:

- controller, processors, and sub-processors;
- purposes and lawful bases for each data category;
- the Article 10 basis/Member State law analysis for offence-related
  allegations;
- transparent Slovak privacy information shown before collection;
- records of processing and processor agreements;
- a data-protection impact assessment screening, likely followed by a DPIA;
- data-subject request, objection, deletion, and breach procedures;
- international-transfer mechanisms and provider regions;
- age/child reporting assumptions;
- legal retention exceptions.

Consent should not be selected simply because the form can contain a checkbox.
Lawful basis and withdrawal consequences require advice appropriate to the
Slovak operator.

## Data-subject requests

A case capability can prove control of a report but not necessarily the identity
of every person depicted or named. Requests must be handled without revealing
another person's data. The system should support search by internal case
reference, contact vault entry, and media hash under a privileged, audited
procedure.
