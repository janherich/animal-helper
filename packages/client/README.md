# Client

Framework-free reporter command client. Vue screens project this state and call
these methods; they do not own retries, capabilities, or `expectedVersion`.

The package is browser-safe (Web Crypto, no Node APIs). IndexedDB is a later
`CaseStore` adapter; tests and first Vue wiring use the memory store.

```ts
import {
  createCaseSession,
  createFetchTransport,
  createMemoryCaseStore,
} from "@animal-helper/client";

const session = createCaseSession({
  store: createMemoryCaseStore(),
  transport: createFetchTransport({
    baseUrl: "http://127.0.0.1:8787",
  }),
});

await session.openDraft();
await session.attachLocation({
  schemaVersion: 1,
  address: "Synthetic testerska 1",
});
await session.submit();
```

Durability labels: `device_only`, `queued`, `acknowledged`, `received`,
`closed`, `needs_attention`. Snapshots never include the capability. Importing a
capability from a URL fragment is status-only until the API exposes a stream
version.

`VERSION_CONFLICT` is not retried by bumping `expectedVersion`. That would
change the command body after a possible accept.
