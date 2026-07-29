# API composition root

The central API will run as Supabase Edge Functions using TypeScript/Deno. This
directory will contain application composition and HTTP adapters; deployable
function entry points live under `supabase/functions`.

The API is the sole public domain-command boundary. It:

- validates versioned contracts;
- authenticates a case capability or administrator session;
- enforces authorisation, assurance level, quotas, and rate limits;
- invokes pure domain decisions;
- atomically appends events, updates projections, and enqueues outbox work;
- signs narrow object-store operations;
- returns explicit, non-sensitive command/query results.

It does not proxy bulk media, expose tables directly to browsers, embed provider
SDK objects in domain code, or perform external delivery inside a database
transaction.
