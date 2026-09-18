# Step 4 — W13 / W14 presentation draft

One advice page renders both visual variants: red prohibitions only (W13) or red and green blocks (W14). The ordered
`blocks` array supplies stable IDs, kind (`avoid` or `do`), localized section titles and ordered items with titles and
optional descriptions. The client maps the kind to the Figma colors and paw icon, and numbers each list sequentially.
The fixture also supplies locale, page copy, progress, allowed actions and back target.

The local preview goes from confirmed W09 answers to W14. W13 is the same renderer with `warningsOnlyFixture`. Route
access requires an in-memory identification, location and confirmed-details marker; changing answers or identification
invalidates that marker. This is a preview guard, not authorization. The backend must validate answers and return the
applicable advice; the frontend must not infer medical recommendations from selections.

Current fixtures deliberately contain illustrative placeholder instructions, visibly marked as not case advice. They do
not use the raptor-specific instructions in the design for arbitrary selected species. "Rozumiem" only shows an honest
local acknowledgement; contact/instruction screens are not implemented yet. No API request, report submission, triage or
veterinary advice generation occurs.
