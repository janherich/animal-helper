# Pomôžte sami — working presentation contract

W22 is a local preview, not an implemented API. `SelfHelpView` in `src/app/pages/fixtures/self-help.ts` describes the
proposed payload. Agree on and validate the final schema at the server boundary before connecting production content.

The server supplies translated copy, layout, permitted actions and an ordered `blocks` array. Supported blocks are
titled sections with paragraphs, ordered/unordered lists, danger/warning notices and dividers. Paragraphs and list items
contain text runs with optional strong/emphasis and HTTP(S) links. Text is escaped; arbitrary HTML, scripts, embedded
widgets and unsafe URL schemes are not rendered. Images are not part of this first text-only version.

The contact fixture's `actionTargets.alternatives` selects W22 independently of its label (currently “Iné možnosti
pomoci”). The in-memory session remembers the originating contact screen for Back. Advice remains accessible through the
existing responsive Rady action. The same preview guard as the contact screens applies; it is not server authorization.

Both outcome buttons currently announce that the next screen is not implemented. They neither submit a result nor claim
success. A thank-you screen and the unsuccessful-outcome destination need separate implementation and explicit server
action contracts.

All fixture paragraphs are neutral formatting examples, not animal-care instructions or legal guidance. Production
advice, applicability, ordering and warnings must come from an approved source on the backend.
