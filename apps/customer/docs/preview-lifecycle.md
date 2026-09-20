# Local preview lifecycle

This is fixture behaviour, not backend authorization or a replacement for server commands.

- Completing a report replaces the thank-you history entry with the home screen. Once that navigation succeeds, the
  in-memory case is released (including media references). Existing route guards reject older history entries without a
  session. A new homepage entry starts a fresh case.
- Confirming changed coordinates invalidates advice, the previous contact return target and road-specific answers/report
  results. Identification and unrelated detail answers remain. Confirming the same coordinates does not invalidate
  results merely because the label/source changed.
- Animal details reconcile their draft when the question schema changes. Removed questions/options/descriptions are
  dropped; compatible fields retain the user's input. New or retyped fields receive supplied defaults. Validation-only
  responses do not reset the draft. Updating defaults alone does not overwrite existing input.

During API integration, replace the preview decisions with the server's case status, allowed actions and next view.
Successful submission must precede the completion animation and cleanup.
