# Step 3 — draft presentation contract (not an API)

One `page-animal-details.vue` renders the W09 family. Figma variants are states/data, not independent implementations.
W40 edits identification via global leaf search, media, or manual selection. Successful manual/search selection returns
to W09. Answers remain in the in-memory session when editing identification. The backend must later decide which answers
remain applicable after a species change, and return only the required question blocks, optionally prefilled.

`fixtures/animal-details.ts` currently supplies localized headings, actions, navigation targets and ordered `questions`.
Each block has a stable ID, localized label, kind (`multiple`, `single`, `text`), requiredness and options. Options have
stable IDs, localized labels, optional exclusive selection and an optional expanding description field. A text block has
an optional placeholder and no options. Empty questions are valid: the client does not infer missing questions. The
preview requires an answer to each required choice group; a required text block rejects whitespace-only values. These
are provisional validation rules, not confirmed backend requirements. Additional option descriptions are optional.

Answers use question/option IDs, not labels. In this preview, extra descriptions use `questionId:optionId` keys; the
final API should define an explicit answer schema and validate it server-side. Deselecting an option clears its
dependent description. `exclusive` options such as "Neviem" cannot coexist with other answers in the same checkbox
group.

The current example uses injured-animal questions regardless of entry point. Dead-animal and other-situation fixtures
are not implemented yet. They should supply different blocks to the same renderer. Likewise, pagination can later be
driven by server responses without adding a component for every question combination.

Media processing is deliberately simulated: no upload or AI call takes place. Its result is the failure state with
manual recovery as the only primary CTA. This state shares the W09 route; its Figma frame duplicates the W09c name also
used for a completed form. That identifier ambiguity must be resolved before adopting server screen IDs.

The final "Zobraziť možnosti pomoci" action now opens the W14 presentation fixture after local validation.
It does not request real advice. See [advice-contract.md](./advice-contract.md).
Reloading loses the preview session. Direct routes require local prerequisites, not real authorization.
