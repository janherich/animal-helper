# Data-driven disabled states

Dynamic details questions and their options accept optional `disabled` flags (default false).
A disabled question uses native fieldset disabling, including nested text fields. A disabled option cannot be
chosen and its associated description cannot be edited. Existing answers are retained, not silently cleared.
Disabled questions do not block client-side required validation. A preselected disabled option can still satisfy
its group's requiredness; an unanswered required enabled group still needs an answer.

This is a presentation contract, not authorization. The backend must validate editable fields and answers itself.
The shared Tailwind Forms theme supplies disabled visuals; server integration remains a fixture simulation.
