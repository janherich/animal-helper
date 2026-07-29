# Offline and synchronisation model

Status: **proposed baseline**

The customer PWA works local-first until it can durably commit data to the
server. The backoffice is online-only.

## Local state

IndexedDB stores:

- a device-generated case identifier;
- the random case capability;
- validated structured fields and bounded free text;
- media blobs and their local SHA-256 digests;
- an append-only local command queue;
- acknowledged server command IDs and stream version;
- the last sanitised status response.

In a separate IndexedDB store, the PWA may keep the last schema-valid public
guidance revision for each supported flow-schema version. This is content, not
case state; it has no capability, contact, media, or private report data and is
replaced only after complete validation.

The service worker caches only versioned application assets and a minimal
offline shell. It must not put API responses, signed media URLs, capabilities,
or case content in the Cache API. IndexedDB persistence is governed separately
by the rules above. A visible action lets the reporter remove local case data
from the device.

Browser storage is best effort, not a backup. The UI must say when a case is
only on the device and when the server has confirmed durable submission.

## Command queue

Every local command gets a UUID before its first network attempt. Retries retain
that ID. Commands are processed in case order with:

- the capability proof;
- `commandId`;
- `expectedVersion`;
- a versioned contract;
- a hash of canonical command content.

The API stores the accepted command ID and outcome. A repeated ID and matching
hash returns the original outcome. A repeated ID with a different hash is
rejected. Version conflicts cause the client to fetch the server state and
reconcile through an explicit domain rule; they are never resolved by
last-write-wins.

Sync is triggered by foreground activity and browser connectivity signals. The
Background Sync API is an optional optimisation because browser support and
execution are not guaranteed.

## Media protocol

Media is never embedded in event payloads or proxied through the static host.

1. The client validates type and configured size and computes SHA-256 locally.
2. When online, it requests a short-lived upload slot for one case and one
   declared content type/size.
3. The API authorises quota and returns an opaque object key plus a signed
   upload URL.
4. The client uploads to a private staging prefix.
5. The client confirms the object key, size, hash, and media kind.
6. Server-side validation checks actual length, magic bytes, allowed codecs, and
   ownership before promoting the reference.
7. Submission is accepted only when all referenced media are confirmed.

Unconfirmed staging objects expire automatically. Upload URLs cannot list, read,
overwrite another object, or exceed the declared size. SVG, HTML, executables,
and archives are prohibited.

Initial policy targets:

- no more than 20 MB total server-accepted media per case;
- voice recording no longer than 30 seconds;
- conservative per-file limits by media kind;
- text length limits defined in shared contracts;
- video accepted only after exact format/size rules and safe-preview processing
  are implemented.

## Submission boundary

Before final submission the capability authorises bounded draft mutation for at
most 30 days. Submission is a single idempotent domain command that freezes
reporter changes. The server acknowledgement includes the committed stream
version and a status projection. The client must not claim success before
receiving it.

After submission:

- queued draft mutations are discarded;
- the capability becomes read-only;
- status polling uses exponential backoff and `ETag`/conditional requests;
- a copied or emailed capability works on another device;
- private case content is not returned to the reporter.

## Conflict and failure UX contract

The future UI must distinguish:

- saved only on this device;
- waiting for connectivity;
- uploading media with progress;
- safely received by the server;
- needs attention because validation or the 30-day deadline failed.

Closing the tab, a service-worker update, duplicate network delivery, or a
server timeout must not create duplicate cases or double-submit a case.
