# Domain events and persistence

Status: **proposed baseline**

Event sourcing is used for the case aggregate because routing, administrator
decisions, document generation, and dispatch benefit from a durable explanation
of how the current state was reached. It is not used as a reason to retain
personal data forever.

## Storage model

An event row contains operational and domain facts:

```text
event_id
stream_id
stream_version
event_type
schema_version
occurred_at
recorded_at
actor_kind
actor_reference?      opaque; never email or capability
command_id
correlation_id
causation_id?
payload               privacy-reviewed JSON
```

Database constraints:

- primary key on `event_id`;
- unique `(stream_id, stream_version)`;
- unique `command_id` for a case-changing command;
- positive stream and schema versions;
- append permission only through a transaction-owned database function.

The event payload may say that contact information or media was supplied and
refer to an opaque private-record identifier. It must not contain:

- names, email addresses, telephone numbers, or access capabilities;
- free text written by a reporter or administrator;
- exact locations or precise coordinates;
- original filenames, object-store URLs, or media bytes;
- generated document contents or message bodies.

Those values live in erasable tables or private object storage. Erasing them
leaves the event history structurally valid: it records that an action happened
without preserving the sensitive content.

## Write transaction

For every command:

1. validate the transport schema and authenticate the actor;
2. load the stream and rebuild or verify aggregate state;
3. reject a mismatched `expectedVersion`;
4. evaluate `decide(state, command)` as a pure function;
5. append returned events;
6. update synchronous read projections;
7. insert any required outbox items;
8. commit once.

The same `commandId` with the same authenticated scope returns the original
outcome. Reuse with different content is rejected and security-logged without
logging the content.

## Evolution rules

- Event type and schema version are explicit.
- Stored event schemas are immutable.
- Compatible readers may upcast old events through pure, tested functions.
- A semantic correction is a new compensating event, not a mutation or deletion
  of an old event.
- Event names use completed facts, not implementation commands.
- A projection must be reproducible from events plus the current availability of
  referenced private data.

Cryptographic erasure or physical deletion of private records is allowed and
expected. Deleting event rows is reserved for a documented legal requirement and
uses a controlled migration with an integrity report.

## Projections

At minimum, separate:

- internal case queue and detail projection;
- permanent, sanitised status projection;
- aggregate statistics;
- audit view;
- outbox/delivery view.

The permanent status projection contains only a coarse public state and
timestamps safe to reveal to the capability holder. It never exposes routing
notes, recipients, allegations, exact locations, media, contact data,
administrator identity, or official-document contents.

Statistics are produced from non-identifying dimensions with small-cell
suppression. Raw case access is not a statistics API.

## Snapshots and rebuilds

At the projected volume, replaying a single case stream is cheap and snapshots
are not initially necessary. Projection rebuild tooling must:

- run from a consistent event-store position;
- write into a new projection table/version;
- verify counts and invariants;
- switch readers only after verification;
- never re-trigger outbox effects.

## Audit events versus domain events

Domain events explain case state. Security audit records explain access and
privileged operations. Both are append-only, but audit records have their own
retention and access policy. An audit record identifies the administrator and
operation, not the sensitive content read or sent.
