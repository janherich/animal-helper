# Case matrices

Status: **source inventory, not published guidance**

Last imported: 2026-08-31

These spreadsheets are the product case-flow matrices for Slovakia. They are the
source for code-owned animal-kind keys, flow templates, and screen mapping. They
are **not** a published guidance revision: cells still contain draft notes,
missing stray copy, and operational to-dos.

Typed keys derived from these files live in `@animal-helper/guidance`. Screen
IDs map onto the current customer PWA in [screen-map.md](screen-map.md).

## Files

| File                                                         | Workbook / sheet                                              | Rows                |
| ------------------------------------------------------------ | ------------------------------------------------------------- | ------------------- |
| [source/animal-cruelty.csv](source/animal-cruelty.csv)       | `Zverolinka_tyranie_flow` / `01_ZVIERATA_FLOW`                | TYR-001–TYR-116     |
| [source/injured-and-stray.csv](source/injured-and-stray.csv) | `Zverolinka_zranene_vsetky_zvierata_flow` / `01_OBSAH_ZR_ZAT` | ZRZAT-001–ZRZAT-232 |

Each CSV is sheet 1 of a larger workbook. Other sheets were not exported.

## How to refresh

Replace the CSVs, then regenerate the catalog:

```sh
node packages/guidance/scripts/build-catalog.mjs
pnpm --filter @animal-helper/guidance test
```

## What is filled

- **Cruelty** (`Týrané / zanedbávané`): one user flow for every species, plus an
  acute W02 branch to 158, then internal RVPS / SIŽP / district routing.
- **Injured** (`Zranené`): species-level copy and nine reusable flow templates.
- **Stray** (`Zatúlané`): ID placeholders only. Do not treat those rows as
  guidance.

Injured rows that exist in cruelty but were not filled here: companion rat,
companion snake, companion lizard, farm bees, wild mouse, and wild rat.

## Boundaries

Copy, do/don't text, and contact wording stay in these matrices until a reviewed
guidance revision is published. The catalog stores stable keys, flow assignment,
and contact _kinds_ — not telephone numbers or advice sentences. Jurisdiction
directories remain the place for verified contacts.

Do not copy a matrix cell into the customer PWA as executable workflow logic.
See
[Administered guidance flow](../../architecture/administered-guidance-flow.md).
