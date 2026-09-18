# Fixture-driven presentation: current boundary

Every new screen should receive localized display data, choices with stable IDs, and allowed actions through its view
model. Do not embed business copy, catalogues, case-dependent options, or next-screen decisions in the Vue template.

## Audited screens

| Area                   | Data source                                                                                                  | Deliberately client-side                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Home / draft           | `fixtures/home.ts`: copy, choices, action IDs, draft summary, social links, preview transitions              | Accordion interactions and visual treatments                          |
| Location               | `fixtures/location.ts`: labels, demo places/map point/image, allowed actions, preview targets                | Keyboard navigation, browser geolocation, temporary local search      |
| Media                  | `fixtures/media.ts`: copy, file size and MIME constraints, allowed actions, preview targets, processing view | Local File/object-URL lifecycle, previews, grouped undo, toast timing |
| Processing             | `fixtures/processing.ts`, passed by media view: title, preview copy, demo timing                             | Loading mechanics, animation, cancellation and reduced-motion support |
| Manual group selection | `fixtures/animal-groups.ts`: groups, images, copy, allowed actions, preview back target                      | Rendering and in-memory selection                                     |
| Shell / fallback       | `fixtures/shell.ts` and `fixtures/not-found.ts`: navigation items, labels including accessibility copy       | Focus trap, scroll locking, splash and resilient local fallback       |

Screen `layout.showMenu` configures the preview route metadata. A future server-view adapter must update layout and
route authorization with each response, not assume the static preview route table is an authorization mechanism.

## Not a completed server integration

Step 3 and identification editing use `fixtures/animal-details.ts`; see
[animal-details-contract.md](./animal-details-contract.md) for the dynamic block model and preview limitations.
Step 4 uses `fixtures/advice.ts` for ordered prohibition/recommendation blocks; see
[advice-contract.md](./advice-contract.md). Clinical decision-making remains outside the client.

The root shell and route table currently load local fixtures. Labels are already localized; substitution of supplied
`{count}` or `{label}` placeholders is formatting, not translation. Keep a small bundled fallback for
startup/offline/error states where no server view is available.

Navigation targets and `previewActions` only model the demo. They are not API commands. Replace them with agreed action
descriptors, requests, and validated returned views before production. The preview session is in memory, and its route
guards are not security controls. The backend remains authoritative for permissions, transitions and validation;
frontend checks only improve interaction. New types of controls still require client implementation.

See [manual-selection-contract.md](./manual-selection-contract.md) for the first manual screen's draft. Backend schema
ownership and final endpoint/command names remain to be agreed.
