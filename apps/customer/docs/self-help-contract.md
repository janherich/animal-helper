# Pomôžte sami — working presentation contract

W22 is a local preview, not an implemented API. `SelfHelpView` in `src/app/pages/fixtures/self-help.ts` describes the
proposed payload, now based on the shared [instructions contract](instructions-contract.md). Both entry points use the
same renderer with separate page-specific block and action contracts. Agree on and validate the final schema at the
server boundary before connecting production content.

The server supplies translated copy, layout, permitted actions and an ordered `blocks` array. Supported blocks are
titled sections with paragraphs, ordered/unordered lists, danger/warning notices and dividers. Paragraphs and list items
contain text runs with optional strong/emphasis and HTTP(S) links. Text is escaped; arbitrary HTML, scripts, embedded
widgets and unsafe URL schemes are not rendered.

The `images` block has an optional `title` and ordered `items` with `id`, optional `src`, `alt` and `caption`. It
renders a two-column grid of bordered, rounded cards with square image areas and caption strips. Images use contain
sizing, lazy loading and a stable aspect ratio. Missing, invalid or failed images show a paw placeholder with the
supplied accessible description. Sources support root-relative asset paths and HTTP(S) URLs; credentials,
protocol-relative URLs and executable/data schemes are rejected. Production should validate approved image hosts at the
API boundary. Supply localized alternative text and captions and licensed image assets. The showcase includes three
attributed OpenMoji images, a missing-image example and visible text links.

The contact fixture's alternatives entry in `footerActions` selects W22 independently of its label (currently “Iné
možnosti pomoci”). Back traverses router history to the originating contact screen, with a data-defined fallback for
direct entry. Advice remains accessible through the existing responsive Rady action. The same preview guard as the
contact screens applies; it is not server authorization.

The outcome actions target the shared thank-you form: W24 for success and W25 for failure. Neither submits a result. See
[the thank-you contract](thank-you-contract.md).

All fixture paragraphs are neutral formatting examples, not animal-care instructions or legal guidance. Production
advice, applicability, ordering and warnings must come from an approved source on the backend.
