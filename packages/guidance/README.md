# Guidance catalog

Code-owned keys for the reporter guide: animal kinds, flow templates, and screen
IDs. Copy still lives in the product matrices until a reviewed guidance revision
is published.

Source matrices: [docs/product/case-matrices](../../docs/product/case-matrices).

Rules:

- keys are stable (`^[a-z][a-z0-9_]*$`, max 64) and match the form-snapshot
  catalog-key pattern;
- `domestic_cat` keeps the existing fixture identity (`groupKey` domestic,
  `categoryKey` companion);
- stray rows are stubs; cruelty is catalogued but not part of `form_snapshot`
  v1;
- contact fields are typed kinds, not telephone numbers;
- regenerating the catalog is
  `pnpm --filter @animal-helper/guidance sync-catalog`.
