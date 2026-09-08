# Guidance catalog

Code-owned keys for the reporter guide: animal kinds, flow templates, screen
IDs, instruction slots, and the bundled injured-copy fallback.

`resolveGuidanceWalk` turns a situation and animal-kind key into the catalogued
screen sequence. `resolveKindItems` attaches published or bundled copy to those
screens. The backoffice editor, public `GET /guidance`, and the customer PWA
share that resolver.

Source matrices: [docs/product/case-matrices](../../docs/product/case-matrices).

Rules:

- keys are stable (`^[a-z][a-z0-9_]*$`, max 64) and match the form-snapshot
  catalog-key pattern;
- `domestic_cat` keeps the existing fixture identity (`groupKey` domestic,
  `categoryKey` companion);
- stray rows are stubs; cruelty is catalogued but not part of `form_snapshot`
  v1;
- contact fields are typed kinds, not telephone numbers;
- copy is bounded plain text; URLs, HTML, and phone-like numbers are rejected;
- regenerating the catalog and fallback is
  `pnpm --filter @animal-helper/guidance sync-catalog`.
