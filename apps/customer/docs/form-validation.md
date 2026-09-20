# Form validation response (working proposal)

Forms may include `validation: { formErrors?: string[], fieldErrors?: Record<string, string[]> }`. These messages
describe a rejected submission; they are plain text, never HTML. There is no API call or server authorization
implementation yet.

## Field keys

| View                                             | Field key                                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| Animal details                                   | Question ID; `questionId:optionId` for an option description                     |
| Thank you                                        | Contact field ID; `reason:optionId`, `description:optionId`, `consent:consentId` |
| Manual identification                            | `animal` for the selection; `description` for other animal text                  |
| Unsuccessful report (cruelty or other situation) | `reasons`, `description`                                                         |

The response must reference existing, visible, enabled fields. Do not send field errors for disabled or hidden controls:
put non-actionable/general failures in `formErrors`. Keep IDs stable and unique within the form.

The client retains the user's current values when validation changes, links errors using `aria-describedby`, highlights
invalid controls and focuses the first error on attempted confirmation. Editing a field clears its response errors, not
other fields' errors; the general summary clears because the draft no longer matches the rejected submission. Native
required/format checks still apply. Clearing a message does **not** establish server validity: the eventual backend must
revalidate every submission and authorize commands and state transitions.

Form-level errors alone permit retry. Field errors prevent local completion until edited or replaced by a new response.
The backend adapter must validate incoming payloads, including error keys, before rendering; that integration remains
deferred with the API.

## Development preview

The normal thank-you fixture contains an invalid email and its inline error, shown at the end of the existing flow
without a separate preview route. Correcting or clearing the optional email preserves the remaining values. Derived
thank-you variants inherit this example. Replace these sample values/errors with real server responses during API
integration. A second fixture covers independent radio-group and expanded-text errors in animal details, exercised by
unit tests.

Route access and commands still use the existing preview flow/allowed-actions mechanism. This change prepares error
presentation only; it is not an authoritative server-contract state machine.
