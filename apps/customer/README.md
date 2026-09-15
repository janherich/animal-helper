# Customer

Vue 3 + TypeScript + Pug + Tailwind 4. Technical foundation, not the finished reporting flow or Figma design. Tool
versions match the monorepo.

From the repository root:

```sh
pnpm install
pnpm --filter @animal-helper/customer dev
```

Open http://127.0.0.1:5173. Root `pnpm dev` also starts this app alongside the existing API, backoffice and database
setup.

```sh
pnpm --filter @animal-helper/customer typecheck
pnpm --filter @animal-helper/customer build
pnpm --filter @animal-helper/customer lint
pnpm --filter @animal-helper/customer lint:fix
pnpm --filter @animal-helper/customer format
pnpm --filter @animal-helper/customer format:fix
pnpm --filter @animal-helper/customer test:unit
pnpm --filter @animal-helper/customer test:unit --run
pnpm --filter @animal-helper/customer test:unit:coverage
pnpm --filter @animal-helper/customer exec playwright install chromium webkit
pnpm --filter @animal-helper/customer test:e2e
pnpm --filter @animal-helper/customer test:e2e:ui
```

`format` checks formatting; `format:fix` writes changes. This differs from the repository-root `format`, which writes.
`lint` uses a local cache; `lint:fix` applies available fixes. `test:unit` starts watch mode locally; add `--run` for a
single run. Coverage reports are written to `coverage`, and E2E UI mode opens the interactive Playwright runner. `build`
checks types before bundling; `build-only` runs just Vite. The existing two-project typecheck is retained for both Vue
and Node configuration files. The `dev` host and port are defined in Vite configuration.

The shared root `prettier.config.mjs`, `eslint.config.mjs` and `.editorconfig` are the source of truth. Customer-only
overrides preserve the B2B conventions without changing backend rules. Customer scripts use these same shared configs.
Root formatting and linting include customer directly; recursive tests discover its `test` script (a single run),
alongside the other workspace packages. Root typecheck and build continue to include customer as well.

Unit tests live in local `__tests__` folders next to their modules and use the `.spec.ts` suffix (for example,
`src/libs/components/__tests__/base-icon.spec.ts`). E2E tests live in `e2e/tests` with the same suffix.

E2E starts only customer on port 5183 and runs Chromium and WebKit, without an API or database. Production hosting must
serve index.html for unknown URLs to support Vue Router history mode.

## Layers

| Folder          | Responsibility                                                     |
| --------------- | ------------------------------------------------------------------ |
| `src/app`       | Root app, pages, routes and application-specific components        |
| `src/libs`      | General base components, directives, composables and utilities     |
| `src/providers` | Application services; currently Vue Router                         |
| `src/plugins`   | Third-party integration configuration; currently OverlayScrollbars |
| `src/assets`    | Tailwind entry point and original SVG icons                        |
| `src/types`     | Global component declarations                                      |

Create additional folders only when needed. The `@` alias points to `src`. Pinia, i18n, API clients, form libraries, PWA
and server-driven navigation are intentionally absent. VueUse core is available. The previous implementation lives in
`../customer-backup`; never import runtime code from that reference archive.

## Component conventions

Use kebab-case filenames, `<script setup lang="ts">` and `<template lang="pug">`. Semantic classes use Pug dot notation;
Tailwind utilities belong in `class` or `:class`. Semantic classes do not require separate CSS rules.

```pug
section.report-location(class="flex flex-col gap-6 p-4")
  AppHeader
  base-icon.report-location__icon(
    name="search",
    class="size-6"
  )
```

`attachLibs(app)` eagerly registers `libs/components/**/base-*.vue` globally. Use them in kebab-case without imports.
Add their types to `src/types/components.d.ts` for template prop checking and completion. Ordinary components require
explicit imports and PascalCase tags.

Directives in `libs/directives/**/*.ts` use a default Vue directive export and are registered under their kebab-case
filename: `click-outside.ts` becomes `v-click-outside`. Tests and declaration files are excluded. Duplicate component or
directive names fail startup. Keep helpers outside the directives folder. No speculative directives are added.

Customer formatting follows B2B: 120-character lines, single quotes in scripts, no semicolons or trailing commas, and no
parentheses around a single arrow parameter. Imports are organized automatically, without removing unused imports;
ESLint reports those instead. These settings are scoped to customer, not the backend or backup app. EditorConfig keeps
editor indentation and line endings aligned with the formatter.

Prettier preserves class notation (`pugClassNotation: as-is`), uses double quotes in Pug and wraps attributes above one
attribute. Tailwind class sorting is enabled. The semantic/utility distinction is a documented convention, not a custom
lint rule. Vue/Pug lint rules apply only to this customer package. Use the Vue Official editor extension; the Pug
language plugin is configured in tsconfig. ESLint includes Vitest and Playwright rules for their respective test
folders. The final Prettier compatibility config disables conflicting formatting rules; formatting is checked separately
from code correctness.

## Tailwind and icons

Tailwind includes Preflight and its default theme. No legacy CSS, external fonts or Figma tokens are copied over.
Styling uses utility classes first.

The 50 original SVGs from the previous Figma export live in `src/assets/icons`. Their source-node mapping is recorded in
`src/assets/icons/manifest.json`. `vite-plugin-svg-icons-ng` generates symbols with IDs `icon-[name]` and injects them
into HTML. Add or edit an SVG and Vite updates it automatically; no icon build command or committed generated sprite is
needed. SVG optimization is disabled to preserve geometry and colors; the baker still rewrites local IDs and references.
Only trusted, reviewed SVGs belong here; this pipeline is not an upload sanitizer.

`base-icon` takes `name: string` (SVG filename without extension) and optional `label`. It defaults to a decorative 24px
icon. For meaningful standalone icons, provide a label; for icon-only buttons, label the button instead. Override size
with `size-*`. Original colors are preserved; `text-*` does not recolor the set. Unknown names render no icon; verify
names against the source files.

## Scrollbars

`attachPlugins()` configures shared defaults before mounting. The root app uses deferred body initialization and
`autoHide: scroll`. Initialization is cancelled when native overlay scrollbars exist or when body initialization would
interfere with native behavior. This uses feature detection, not a Safari check. The official composable cancels pending
work and destroys its instance on unmount.

Use `OverlayScrollbarsComponent` directly for internal areas. Shared cancellation defaults apply there too; keep
`overflow-auto` on the bounded root so it remains scrollable when initialization is cancelled. No `base-scroll-area`
wrapper exists. Router navigation restores saved scroll on history traversal and otherwise starts at the top.
