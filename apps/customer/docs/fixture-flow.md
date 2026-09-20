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

## Backend integration later

Replace the mock provider with validated API responses for the current page and commands. The backend owns scenario
selection, permitted commands, state updates, validation errors and the next destination. The frontend renders supported
views and navigates to supported internal routes; it must not execute code supplied in payloads.

This is **not yet a drop-in asynchronous API adapter**: most mock commands are synchronous, routes still inject
presentation fixtures, draft fields remain local, and upload/submission are not connected. Integration must add async
loading/error handling, response validation and synchronization of authoritative state. The media simulator is already
abortable and ignores results for a replaced session. Contact form values are not submitted or stored by this mock.

Frontend guards and disabled controls are only UX checks. The real server must independently validate every command, its
payload, permissions and current case revision. No backend authorization or new CI job is implemented here.

Regression coverage includes scenario selection, allowed home/follow-up actions, road documentation returns, and
cancelled/stale media results, alongside browser tests for complete flows and history.
