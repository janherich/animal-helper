# Screen map: matrices → customer walk

The matrices number screens as W01–W26. The customer PWA implements the shared
prefix, then follows the catalogued injured flow with planned-screen
placeholders.

## Current PWA (implemented)

| Route                 | PWA step       | Matrix screens it stands in for                             | Client call                        |
| --------------------- | -------------- | ----------------------------------------------------------- | ---------------------------------- |
| `/w01`                | situation      | W01 situation type                                          | `openDraft`                        |
| `/w03`                | location       | W03a GPS / W03b address                                     | `attachLocation`                   |
| `/w04`                | photo          | W04 photo (optional skip; not a case command yet)           | local `continue`                   |
| `/w09`                | details        | W09 condition, W09b other, W11 description                  | `attachFormSnapshot`               |
| `/w13`–`/w23`, `/w26` | planned + copy | Flow screens after details, before reporter contact         | none (copy from `/guidance`)       |
| `/w24`                | contact        | reporter contact + submit — **not** matrix W24 “who helped” | `attachContact` then `submitDraft` |
| `/thank-you`          | thanks         | post-submit status                                          | public status                      |

Injured reports pick an animal kind on `/w09`. The resolver in
`@animal-helper/guidance` then inserts that kind’s planned screens (warnings,
typed contacts, volunteers, self-help) before `/w24`. Stray still uses the
four-step skeleton. Matrix W25 stays in the backoffice preview only; the PWA
submits on `/w24`. Cruelty is catalogued but not selectable. `form_snapshot` v1
still accepts only `injured` and `stray`.

## Injured walk (intended)

Shared prefix, then a flow template chosen by animal kind:

`W01 → W03a/W03b → W04 → W09 → W09b? → W11 → W13 or W14 → contacts → W21? → W22/W23? → W24 who helped → W25a/W25b`

| Flow key                     | Matrix ID                 | First contact                  | Notes                                 |
| ---------------------------- | ------------------------- | ------------------------------ | ------------------------------------- |
| `injured_companion`          | FLOW-ZR-DOM               | municipality capture, then vet | Dog skips the juvenile question       |
| `injured_farm`               | FLOW-ZR-HOSP              | municipality capture           | Self-help only for some species       |
| `injured_protected_standard` | FLOW-ZR-CHR-STD           | ŠOP SR rescue                  | Most wild birds, reptiles, amphibians |
| `injured_game`               | FLOW-ZR-ZVER              | hunting manager / OPK          | No self-help                          |
| `injured_exotic`             | FLOW-ZR-EXOTIC            | municipality, then exotic vet  | Self-help only if the species is safe |
| `injured_exotic_dangerous`   | FLOW-ZR-EXOTIC-NEBEZPECNE | 112                            | Tiger; no volunteers                  |
| `injured_small_wild`         | FLOW-ZR-MALY-WILD         | volunteers first               | Mole, vole; W26 SLA still open        |
| `injured_pigeon_identify`    | FLOW-ZR-HOLUB-ROZLISENIE  | ŠOP only if wild               | Distinguish domestic vs wild pigeon   |
| `injured_turtle_identify`    | FLOW-ZR-KORYTNACKA-ID     | ŠOP or municipality after ID   | Warning frame is dynamic              |

W16/W17 appear in the injured sheet grouping as warning variants; filled rows
use W13 or W14.

## Cruelty walk (intended, not in the PWA)

`W01 → W02 (158 if acute) → W03a/W03b → W04 → W06a/W06b → W11 → W24 → assign authority → draft petition → admin approval`

W02 shows 158 only for acute suspicion of a cruelty crime; the reporter then
continues the report. Authority (RVPS, SIŽP, district land/forest office) is an
internal assignment, not a public contact tree.

## Screen registry

| Key                           | Role                                          | In current PWA                     |
| ----------------------------- | --------------------------------------------- | ---------------------------------- |
| `w01`                         | Situation type                                | yes, `/w01`                        |
| `w02`                         | Acute 158 (cruelty)                           | no                                 |
| `w03a` / `w03b`               | Location                                      | collapsed on `/w03`                |
| `w04`                         | Photo / evidence                              | yes, `/w04` (optional skip)        |
| `w06a` / `w06b`               | Cruelty evidence checkboxes                   | no                                 |
| `w09` / `w09b`                | Condition / other                             | collapsed on `/w09`                |
| `w11`                         | Free-text description                         | collapsed on `/w09`                |
| `w13` / `w14`                 | Do-not / do-before-contact                    | copy on `/w13`, `/w14`             |
| `w15` / `w18` / `w19` / `w20` | Typed contacts                                | copy + contact key                 |
| `w16` / `w17`                 | Warning variants                              | no (not in filled flows)           |
| `w21`                         | Volunteers                                    | copy on `/w21`                     |
| `w22` / `w23`                 | Self-help                                     | intro copy on `/w22` where present |
| `w24`                         | Who helped (matrix) vs reporter contact (PWA) | path reused, meaning differs       |
| `w25a` / `w25b`               | Why help failed                               | backoffice preview only            |
| `w26`                         | Volunteer SLA                                 | placeholder `/w26`                 |
| `thanks`                      | Post-submit                                   | yes, `/thank-you`                  |

## Open content gaps that block a full walk

- All stray rows.
- Self-help step copy (W22/W23).
- Municipality, vet, ŠOP, and OPK directories.
- Juvenile-specific bird branch (noted on raptor rows).
- Species that are both protected and game: self-help must not be offered until
  that overlap is reviewed.
- Companion snake/lizard/rat, farm bees, wild mouse/rat injured rows.

Guidance publication still requires the process in
[Administered guidance flow](../../architecture/administered-guidance-flow.md).
This map only records what the matrices ask the application to own.
