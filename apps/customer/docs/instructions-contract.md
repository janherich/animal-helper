# Unified instructions presentation contract

`InstructionsView` is the shared renderer model. ContactsView and SelfHelpView are separate, narrower page contracts.
The existing routes are entry points to one `PageInstructions` renderer, with page-specific content and allowed
destinations. API integration and runtime schema validation remain pending; fixtures are local previews and do not
decide production help recommendations.

`blocks` is an ordered, repeatable union: contact cards, contact notices (important/critical), instruction lists,
volunteer-style links, formatted sections, ordered/unordered lists, danger/warning notices, dividers and image grids.
Contacts use contact cards, notices, instructions and links. Self-help uses sections, lists, notices, dividers and
images. Existing notice variants retain their visual designs. Each block needs a unique ID. Each page showcases its own
supported block types.

`footerActions` is the ordered array of visible actions: `id` (resolved/unresolved/alternatives), translated `label`,
`appearance` (primary/secondary) and `target` (W22/W24/W25). Omit an action to hide it; remove its ID from
`allowedActions` to disable it. An empty array renders no footer. The client only supports these known route targets,
not arbitrary executable actions. `backTarget` provides the fallback when router history has no valid preceding contact
page. Self-help Back otherwise traverses history without pushing another entry. Contacts allow success to W24 and
alternatives to W22; self-help allows success to W24 and failure to W25. The old fixed footer copy fields and
`actionTargets` have been replaced by this array.

The server determines which blocks and actions are relevant. The client owns safe rendering, styling, accessibility and
interaction. External URLs still pass the existing scheme checks. Content is escaped, never executed as HTML. See
self-help-contract.md for rich text/images and contacts-contract.md for contact block details.
# Page-owned advice payload

Each contacts or self-help response can include `advice` with `triggerLabel`, `locale`,
`copy: { drawerTitle, closeAdvice, acknowledge }`, and the complete ordered `blocks`
array (`AdviceBlock[]`, including both `avoid` and `do` variants).
The server sends this content with the page response, even if advice was already
shown on the preceding advice page. The client must not reuse a previous page's
advice or fall back to a global fixture. Omitting `advice` hides the trigger and panel.

Opening advice is local presentation, not navigation: a bottom sheet on narrow
screens and a centered dialog on desktop. Closing restores the originating page
and focus. Both render exactly the current page's advice payload. Fixtures include
the full nested payload today; sharing fixture source data is not an API dependency.
