# Fixture-driven preview flows

The preview runs a mock server **in the browser**, not a real backend. Its scenario decisions are deliberately grouped
under `src/app/pages/fixtures/`; they are not authoritative client business rules.

## Responsibilities

- `flow-scenarios.ts`: scenario map for location and detail-form continuation, and shared preview navigation policy.
- Presentation fixtures: labels, available choices/actions and their targets, including the police result branches.
- `preview-server.ts`: selects view variants, return targets, embedded advice and draft-dependent route availability.
- `flow-actions.ts`: handles confirmations, branch changes, report outcomes, documentation and simulated AI results;
  returns navigation targets without operating a router.
- `preview-session.ts`: mock draft storage and lifecycle/invalidation rules. Road answers are separate from animal
  detail answers so documenting an animal cannot erase road context.
- `flow-client.ts`: application entry point to the current provider. `preview-flow.ts` remains a compatibility entry
  point for reading the in-memory draft.

## Current scenarios (not final business requirements)

| Entry                    | Preview path                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Injured / stray / dead   | Location → identification → details → advice → contacts                                                |
| Cruelty                  | Urgency → police result when applicable → documentation → location → identification → details → thanks |
| Other: road / rail       | Location → road details → contacts; failure → reasons → identification → details → thanks              |
| Other: human activity    | Location → identification → details → advice → contacts                                                |
| Other: another situation | Location → identification → details → thanks                                                           |

Contacts and self-help keep separate routes. Their footer actions come from the view payload; success leads to thanks,
and self-help supports the failure variant. History, focus and animations stay in the frontend. The mock provider
supplies eligible history targets and fallback destinations. Advice in the header comes from the same fixture view
selection used by the contact page, rather than independently choosing a second variant.

## Walk adapter

Injured and stray reports use `src/app/walk/adapter.ts`. It keeps the fixture session for presentation, and it persists
process status through `@animal-helper/client`:

| Step                    | Server command                        | Next screen                                   |
| ----------------------- | ------------------------------------- | --------------------------------------------- |
| Start injured or stray  | `create_draft`                        | walk view after `/w01`                        |
| Confirm location        | `attach_location`                     | walk view after `/w03`                        |
| Confirm animal details  | `attach_form_snapshot`                | walk view after `/w09`, or contact if none    |
| Submit the contact form | `attach_contact`, then `submit_draft` | completion only after `publicState: received` |

Photo and manual identification stay on the device. The walk view is resolved locally from those facts plus the
published guidance revision, with the bundled revision when `/guidance` is unavailable. The command reply's
`publicState` is the persisted case status. Navigation waits for a successful command.

Dead, cruelty and other situations are still fixture-only. The command schema accepts only `injured` and `stray`. Guide
buttons after the first post-details screen still follow the fixture targets, because those branches are not in the walk
view. Uploads are not sent.

Browser tests set `E2E_STUB_COMMANDS=1`, which accepts the command envelope without Postgres. `pnpm dev` proxies
`/commands`, `/status` and `/guidance` to the API.

Frontend guards and disabled controls are only UX checks. The real server must independently validate every command, its
payload, permissions and current case revision. No backend authorization or new CI job is implemented here.

Regression coverage includes scenario selection, allowed home/follow-up actions, road documentation returns, and
cancelled/stale media results, alongside browser tests for complete flows and history.

## Leaving and resuming a report

The shared flow navigation exposes an X button from the first situation-specific screen, including cruelty and Other
interstitials. It opens the confirmation “Opustiť hlásenie prípadu”. Continue and Escape dismiss the dialog without
changing the report; focus returns to X. Confirming calls the fixture `leave` command and navigates to its returned
homepage target.

The fixture provider retains one suspended report, its resume screen and demo progress, and supplies the homepage draft
card from that report. Resume restores the same session; “Uzavrieť prípad” removes the draft. Confirmed answers and
media stay in the session. Unsubmitted location, manual selection, identification search and final form controls are
checkpointed separately, only on explicit exit.

Accepted injured and stray commands are stored by the API. The browser case session is still in memory, so refreshing or
closing the app drops the capability and the local draft even though the server draft remains until it expires. Files
and unsubmitted form controls are not sent. IndexedDB resume is still later work.
