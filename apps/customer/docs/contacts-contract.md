# Contacts — working presentation contract

The shared [instructions renderer](instructions-contract.md) accepts ordered `blocks`, including `contact`, `notice`,
`instructions`, `link`, rich text and images. The server determines the content, order, number of cards, localized text,
availability labels, distances, instructions, links, and allowed actions. The client does not select an organization or
infer advice from the identified animal.

Contact cards support optional address, distance, opening status (open/closing/closed), telephone and navigation.
Notices support `important` (pale yellow) and `critical` (solid yellow). Instructions contain a heading and stable-ID
list items. The link block supports the volunteer variant. All text is plain text, never injected HTML.

Fixtures: W15 municipality, W18 multiple clinics and cost warning, W20 police and both notice levels, W21 volunteers,
W36 motorway patrol. W22 self-help is described in [the self-help contract](self-help-contract.md). After completing the
fixture flow and acknowledging advice, W15 opens a combined showcase by default: all supported contact blocks, with
namespaced IDs. The individual municipality fixture remains available separately for component tests. The default
contact page displays all examples together without a variant selector. Individual fixtures remain available for testing
the supported variants in isolation.

Phone links only allow tel numbers; other links only allow HTTP(S) without credentials. Fixtures intentionally have no
live phone/navigation/volunteer links. Their wording and addresses are placeholders, not verified emergency, medical, or
legal guidance. The ordered `footerActions` array defines visible buttons, labels, appearance and destinations. The demo
alternatives action opens W22; the resolved action opens W24 without submitting anything. Back has a data-defined
target. The optional `advice` payload contains the trigger label, locale, dialog labels and full ordered advice blocks
(see `instructions-contract.md`). It is supplied with this page, not recovered from a previous page or global fallback.
Omitting it hides the advice action. Below 768px it opens a bottom sheet; on desktop it opens a centered dialog, without
navigation or a stepper. The same renderer supports red-only and combined red/green advice. The mobile sheet is capped
below the measured app header; both presentations scroll internally, lock the background, trap focus and restores focus
to its trigger. Escape, backdrop, close controls and acknowledgement dismiss it. Motion respects reduced-motion. Access
guards only protect the local demonstration; server authorization and final command schema remain to be agreed. This
document is not a claim that a backend API exists.
