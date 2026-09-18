# Manual selection: W06–W08 draft contract

This is a frontend presentation proposal for backend discussion, **not an implemented API**. The current source is
`src/app/pages/fixtures/animal-groups.ts` (`AnimalGroupsView`).

## Presentation model

- `root` is an `AnimalBranch`. Branches contain ordered `children` of arbitrary depth.
- Every node has a stable, globally unique `id`, localized `label`, and optional `imageUrl`.
- `kind: 'branch'` opens its children without confirmation.
- Each branch supplies a localized `otherLabel` for the alternative choice, including its grammatical form. The client
  displays it as provided rather than deriving it from the branch name. The root uses “Iné zviera”.
- `kind: 'animal'` represents a selectable animal and has localized search `detail`.
- “Mláďa” is a regular branch containing sample concrete animals, not an immediate-confirmation shortcut.
- Other-species and unknown alternatives are always available in the shared footer, gated by `select-animal`.
- `props` supplies the persistent heading, description, search labels, progress and preview notice. The heading stays “O
  aké zviera ide?” throughout traversal.
- `copy` supplies alternative labels, required-description text, confirmation and preview status.
- `allowedActions` gates local interactions; `layout`, `locale` and `backTarget` retain their existing roles.

The fixture declares a small sample tree directly, starting with domestic and farm animals. Domestic animals include
cats, dogs, small mammals, captive birds and aquarium animals. Aquarium fish add a deeper freshwater branch; farm
mammals add a separate intermediate level. This is a navigation test dataset, not an exhaustive taxonomy. The component
consumes only the tree. Real animal pictures are pending; missing images show a muted paw.

## Local behaviour

Search is global and includes only animal leaves, not branches. Selecting a result opens its parent branch and marks the
animal, without confirming it. Typing alone does not change the path. Cards traverse the same tree. An icon labelled
“Začať výber odznova” stays inside search, disabled only when there is nothing to reset, and replaces breadcrumbs. It
returns to root, clears search, selection, description and identification metadata, preserving location and media. The
top Back button always returns to media, regardless of tree depth. Forward/back card transitions leave the global search
stationary and respect reduced motion.

The whole page scrolls beneath the main app header; search has no separate sticky section, blur or shadow. Changing a
branch resets page scrolling to the top. The footer stays sticky with a soft gradient above it. The reset control keeps
its place to avoid layout jumps.

The sticky footer always contains the “Ďalšie možnosti” fieldset and one “Potvrdiť voľbu” button. The button is disabled
until a concrete animal, “Iné zviera” or “Neviem identifikovať” is selected. The alternatives are mutually exclusive
radio choices; selecting an animal clears them. The footer stays consistent across branches, expanding only when “Iné
zviera” reveals its required description through the shared BaseExpander. The non-resizable textarea uses a placeholder
and an accessible name rather than a visible label. Blank or whitespace-only text blocks confirmation. Search and cards
remain visible. Changing branch clears selection and description.

Unknown requires confirmation, then records `kind: 'unknown'` and the current branch path (empty at the root), including
available legacy group/category IDs. This is tentative context, not a confirmed species; previous species and
description are not retained. Other species retains the current path (empty at the root) and required, trimmed
description.

Known-animal confirmation stores `kind`, full branch `path` and `speciesId` in memory. Other-animal confirmation stores
`kind: 'other'`, `description` and the current branch path. The preview also keeps legacy `groupId` and `categoryId`
fields for compatibility; the full path is authoritative for deeper nesting. The next step is not implemented; an
explicit local-preview notice is displayed.

## Backend integration

The tree and action model remain provisional. No shared backend contract or API was changed. Agree whether the server
supplies the tree or authorized branch views, how global search supplies the target path, and how back/confirmation
commands are represented. Client route guards are not authorization. The server must validate each action and supply the
next authorized screen.

All user-facing catalogue data and text are fixture-owned today, intended to come localized from the server. Catalogue
IDs, transport, loading/error states, stale responses and route identifiers require backend agreement.

Visual reference: UI Typy obrazoviek. Behaviour reference: developer wireframe annotations plus the agreed global
search, arbitrary-depth traversal and persistent-heading refinements. Wireframes are not a visual specification.
