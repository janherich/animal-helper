# Internationalisation

Package locale dictionaries use stable semantic keys for application chrome,
validation, and accessibility copy. `sk-SK` is the initial and fallback locale
for the pilot; another locale must be loadable without changing domain events or
jurisdiction routing.

Rules:

- no user-visible strings in components, domain events, or API error details;
- ICU-compatible plural/select messages rather than concatenated fragments;
- locale-aware dates, times, numbers, lists, and relative time;
- accessibility labels, validation errors, email text, and document UI are
  translated too;
- legal/privacy copy has an independent version and review record;
- missing keys fail CI for production dictionaries.

Administrator-managed animal guidance is also locale data, but it is delivered
as an immutable, locale-scoped guidance revision so wording can change without a
frontend release. Its copy slots are code-owned semantic keys and use the same
formatting/accessibility rules; jurisdiction remains a separate scope.

The `sk-SK` dictionary now includes temporary customer-shell labels for the
injured/stray walk. Product copy will replace those after language review.
