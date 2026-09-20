# Thank-you form — working presentation contract

The default W24 and W25 previews now use a combined showcase: both reason groups, the green help callout, introductory
text variants, and a single shared contact/consent form. There is no variant selector. `reasonGroups` supports multiple
groups; option IDs are namespaced so each “Other” checkbox and description is independent. Individual fixtures remain
available for tests and future server variants. The combined preview is explicitly labelled as non-production content,
not a business rule.

W24 (success) and W25 (failure) use one renderer and separate `ThankYouView` fixtures. Contacts and self-help route to
these views through data-defined action targets. Back returns to the originating screen. The header has no menu or
advice action, matching the visual design.

The proposed payload includes translated copy, field definitions (stable ID, type, label, placeholder, autocomplete,
required, maximum length), consent definitions and allowed actions. Failure additionally supplies a titled reason group
with independent checkboxes; a reason can reveal a text field using BaseExpander. Reasons, their order and description
requirements are data-driven. In this demo reasons and additional description are optional because their validation
rules have not been agreed.

Name, phone and email are optional. Both consent checkboxes start unchecked and remain independent. Empty contact fields
allow the anonymous preview; a populated email uses browser validation. Final telephone rules, consent
wording/versioning, dependencies and command validation must be agreed with the backend.

Additional fixtures cover W26 (closure outcome options), W38 (green help callout and data-defined return to advice), and
W39 (contact invitation without promising a case update). Optional content regions can be combined or omitted. Contact
and consent lists can be empty. The client does not infer variants from answers: the server must select them. Five
guarded routes allow preview without a production selector.

Inputs remain only in page-local memory; leaving or replacing the view discards them. Nothing is logged, persisted,
submitted or subscribed. “Odoslať a ukončiť” previews the final heart animation, then navigates to the data-defined
submit target underneath the app-owned overlay. The overlay fades only after the heart sequence and
destination page transition have both finished. The green callout is help navigation, not submission confirmation. Real submission is not
implemented. The route guard protects only the demo, not backend authorization.
# Záverečná animácia

Po platnom potvrdení formulára ukážka zobrazí krátku celoplošnú animáciu srdca
a pod ňou naviguje na `submitTarget`. Odkryje ho až po dokončení animácie aj prechodu cieľovej stránky.
Prístupný názov dodáva `completionLabel`.
Pri obmedzenom pohybe sa zobrazí statické srdce bez pulzovania.
Počas animácie nie je možné formulár potvrdiť opakovane.
Pri napojení API sa táto animácia smie spustiť až po úspešnej odpovedi servera;
chyba odoslania musí ponechať formulár aj jeho hodnoty. Súčasná fixture nič neodosiela.
