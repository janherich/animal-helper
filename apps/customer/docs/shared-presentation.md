# Shared presentation infrastructure

- `contracts/forms.ts` defines location, media, processing, details and quick-edit view types independently of fixtures.
  `contracts/other-situation.ts` defines the other-situation selector. Existing type re-exports keep imports compatible.
  These are provisional frontend contracts; incoming API responses still need runtime validation.
- `animal-identification.ts` defines one discriminated result: species and ID, other and description, or unknown. All
  variants retain their branch path. Only confirmation updates it; local edits do not invalidate the saved result.
- `useAutocomplete` owns overlay sizing/placement, keyboard navigation, dismissal and scrolling the active result.
  Callers retain domain-specific matching, permissions and selection. Manual and quick animal search share matching;
  location search retains its own matching of address and detail. No API fetching is introduced.
- `PageIntro` shares back navigation, progress and heading in the six main step views. `PageActions` shares sticky
  footer positioning, safe-area padding and the fade edge. Pages retain their routes, actions and content; atypical
  layouts are not forced into a universal screen component.
- Page navigation focuses the main landmark after the page transition, without scrolling. Reused route components are
  handled after DOM updates. Open dialogs, inert content and already-focused form controls retain focus ownership.
- Chromium and WebKit tests remain available locally. CI integration is deferred to the backend developer; the existing
  CI workflow is unchanged.
