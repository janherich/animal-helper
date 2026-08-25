import "./load-local-env.js";

import { randomBytes, randomUUID } from "node:crypto";

import {
  parseCaseCommand,
  syntheticAttachPrivateDataCommand,
  syntheticCreateDraftCommand,
  syntheticSubmitDraftCommand,
  toDomainCaseCommand,
} from "@animal-helper/contracts";
import { describe, expect, it, beforeAll, beforeEach, afterAll } from "vitest";
import postgres, { type Sql } from "postgres";

import {
  applyCommand,
  applyMigrations,
  defaultMigrationsDirectory,
  getPublicStatus,
  hashCapability,
  hashCommandContent,
  loadRecordedEvents,
  parseCapabilityPepper,
  rebuildCaseProjections,
  type ApplyCommandInput,
} from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
const pepper = parseCapabilityPepper(
  process.env.CAPABILITY_PEPPER ??
    "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);

const now = new Date("2026-08-22T12:00:00.000Z");

const parsed = (value: unknown) => {
  const result = parseCaseCommand(value);
  if (!result.success) {
    throw new Error("synthetic command failed contract validation");
  }

  return result.data;
};

const inputFrom = (
  command: unknown,
  extras: Partial<ApplyCommandInput> = {},
): ApplyCommandInput => {
  const transport = parsed(command);

  return {
    commandId: transport.commandId,
    streamId: transport.streamId,
    expectedVersion: transport.expectedVersion,
    occurredAt: transport.occurredAt,
    correlationId: transport.correlationId,
    actorKind:
      transport.type === "start_review" ||
      transport.type === "complete_case" ||
      transport.type === "purge_private_data"
        ? "administrator"
        : transport.type === "expire_draft"
          ? "system"
          : "reporter",
    domainCommand: toDomainCaseCommand(transport),
    contentHash: hashCommandContent(transport),
    now,
    ...(transport.type === "attach_private_data"
      ? {
          privateRecord: {
            id: transport.privateRecordId,
            payload: transport.privatePayload,
          },
        }
      : {}),
    ...extras,
  };
};

describe.skipIf(!databaseUrl)("event-store integration", () => {
  let sql: Sql;

  beforeAll(async () => {
    if (databaseUrl === undefined) {
      throw new Error("DATABASE_URL is required");
    }

    sql = postgres(databaseUrl, { max: 1, onnotice: () => undefined });
    await sql`drop schema if exists ah cascade`;
    await applyMigrations(sql, defaultMigrationsDirectory);
  });

  beforeEach(async () => {
    await sql`
      truncate
        ah.audit_events,
        ah.outbox,
        ah.case_queue_projection,
        ah.case_status_projection,
        ah.capabilities,
        ah.private_records,
        ah.accepted_commands,
        ah.events,
        ah.streams
      cascade
    `;
  });

  afterAll(async () => {
    await sql.end();
  });

  it("appends, projects, and enqueues outbox work in one transaction", async () => {
    const capability = randomBytes(32);
    const created = await applyCommand(
      sql,
      inputFrom(syntheticCreateDraftCommand, {
        capabilityHash: hashCapability(capability, pepper),
      }),
    );

    expect(created).toMatchObject({
      ok: true,
      value: { outcome: "applied", committedVersion: 1, publicState: "draft" },
    });

    const attached = await applyCommand(
      sql,
      inputFrom(syntheticAttachPrivateDataCommand),
    );
    expect(attached.ok).toBe(true);

    const submitted = await applyCommand(
      sql,
      inputFrom(syntheticSubmitDraftCommand),
    );
    expect(submitted).toMatchObject({
      ok: true,
      value: { publicState: "received" },
    });

    const events = await loadRecordedEvents(
      sql,
      syntheticCreateDraftCommand.streamId,
    );
    expect(events.map((event) => event.type)).toEqual([
      "case.draft_created",
      "case.private_data_attached",
      "case.draft_submitted",
    ]);
    expect(JSON.stringify(events)).not.toContain("synthetic-case-notes");
    expect(JSON.stringify(events)).not.toContain(capability.toString("hex"));

    const [privateRow] = await sql<{ payload: unknown }[]>`
      select payload
      from ah.private_records
      where private_record_id = ${syntheticAttachPrivateDataCommand.privateRecordId}::uuid
    `;
    expect(privateRow?.payload).toEqual({
      syntheticNotes: "synthetic-case-notes",
    });

    const [capabilityRow] = await sql<
      { mutation_allowed: boolean; expires_at: Date | null }[]
    >`
      select mutation_allowed, expires_at
      from ah.capabilities
      where stream_id = ${syntheticCreateDraftCommand.streamId}::uuid
    `;
    expect(capabilityRow).toEqual({
      mutation_allowed: false,
      expires_at: null,
    });

    const outbox = await sql<{ effect_type: string }[]>`
      select effect_type from ah.outbox order by created_at
    `;
    expect(outbox.map((row) => row.effect_type)).toEqual([
      "schedule_draft_expiry",
      "notify_case_queued",
    ]);

    await expect(
      getPublicStatus(sql, syntheticCreateDraftCommand.streamId),
    ).resolves.toMatchObject({
      publicState: "received",
    });
  });

  it("returns the original outcome for an idempotent retry and rejects a reused id", async () => {
    const first = await applyCommand(
      sql,
      inputFrom(syntheticCreateDraftCommand, {
        capabilityHash: hashCapability(randomBytes(32), pepper),
      }),
    );
    const retry = await applyCommand(
      sql,
      inputFrom(syntheticCreateDraftCommand, {
        capabilityHash: hashCapability(randomBytes(32), pepper),
      }),
    );

    expect(first.ok).toBe(true);
    expect(retry).toMatchObject({
      ok: true,
      value: { outcome: "duplicate", committedVersion: 1 },
    });

    const conflicted = await applyCommand(
      sql,
      inputFrom(
        {
          ...syntheticCreateDraftCommand,
          occurredAt: "2026-08-22T13:00:00.000Z",
        },
        {
          capabilityHash: hashCapability(randomBytes(32), pepper),
        },
      ),
    );

    expect(conflicted).toEqual({
      ok: false,
      error: { code: "COMMAND_CONTENT_MISMATCH" },
    });

    const [eventCount] = await sql<{ count: string }[]>`
      select count(*)::text as count from ah.events
    `;
    expect(eventCount?.count).toBe("1");
  });

  it("rejects a stale expected version without appending", async () => {
    await applyCommand(
      sql,
      inputFrom(syntheticCreateDraftCommand, {
        capabilityHash: hashCapability(randomBytes(32), pepper),
      }),
    );

    const stale = await applyCommand(
      sql,
      inputFrom({
        ...syntheticAttachPrivateDataCommand,
        expectedVersion: 0,
        commandId: randomUUID(),
      }),
    );

    expect(stale).toEqual({
      ok: false,
      error: { code: "VERSION_CONFLICT" },
    });

    const [eventCount] = await sql<{ count: string }[]>`
      select count(*)::text as count from ah.events
    `;
    expect(eventCount?.count).toBe("1");
  });

  it("purges private payloads while keeping the event history and rebuilt projections", async () => {
    await applyCommand(
      sql,
      inputFrom(syntheticCreateDraftCommand, {
        capabilityHash: hashCapability(randomBytes(32), pepper),
      }),
    );
    await applyCommand(sql, inputFrom(syntheticAttachPrivateDataCommand));
    await applyCommand(sql, inputFrom(syntheticSubmitDraftCommand));
    await applyCommand(
      sql,
      inputFrom({
        type: "start_review",
        schemaVersion: 1,
        commandId: randomUUID(),
        streamId: syntheticCreateDraftCommand.streamId,
        expectedVersion: 3,
        occurredAt: "2026-08-22T12:00:00.000Z",
        correlationId: syntheticCreateDraftCommand.correlationId,
      }),
    );
    await applyCommand(
      sql,
      inputFrom({
        type: "complete_case",
        schemaVersion: 1,
        commandId: randomUUID(),
        streamId: syntheticCreateDraftCommand.streamId,
        expectedVersion: 4,
        occurredAt: "2026-08-22T12:00:00.000Z",
        correlationId: syntheticCreateDraftCommand.correlationId,
      }),
    );

    const purged = await applyCommand(
      sql,
      inputFrom({
        type: "purge_private_data",
        schemaVersion: 1,
        commandId: randomUUID(),
        streamId: syntheticCreateDraftCommand.streamId,
        expectedVersion: 5,
        occurredAt: "2026-08-22T12:00:00.000Z",
        correlationId: syntheticCreateDraftCommand.correlationId,
      }),
    );

    expect(purged).toMatchObject({
      ok: true,
      value: { publicState: "closed" },
    });

    const [privateRow] = await sql<
      { payload: unknown; deleted_at: Date | null }[]
    >`
      select payload, deleted_at
      from ah.private_records
      where stream_id = ${syntheticCreateDraftCommand.streamId}::uuid
    `;
    expect(privateRow?.payload).toBeNull();
    expect(privateRow?.deleted_at).not.toBeNull();

    const events = await loadRecordedEvents(
      sql,
      syntheticCreateDraftCommand.streamId,
    );
    expect(events.map((event) => event.type)).toContain(
      "case.private_data_purged",
    );
    expect(JSON.stringify(events)).not.toContain("synthetic-case-notes");

    await sql`
      update ah.case_queue_projection
      set workflow_state = 'draft'
      where stream_id = ${syntheticCreateDraftCommand.streamId}::uuid
    `;

    const rebuilt = await rebuildCaseProjections(
      sql,
      syntheticCreateDraftCommand.streamId,
    );
    expect(rebuilt).toEqual({ ok: true, eventCount: 6 });

    const [queue] = await sql<{ workflow_state: string }[]>`
      select workflow_state
      from ah.case_queue_projection
      where stream_id = ${syntheticCreateDraftCommand.streamId}::uuid
    `;
    expect(queue?.workflow_state).toBe("completed");

    const outboxCount = await sql<{ count: string }[]>`
      select count(*)::text as count from ah.outbox
    `;
    expect(outboxCount[0]?.count).toBe("3");
  });

  it("rejects direct event inserts", async () => {
    await sql`
      insert into ah.streams (stream_id)
      values (${syntheticCreateDraftCommand.streamId}::uuid)
    `;

    await expect(
      sql`
        insert into ah.events (
          event_id,
          stream_id,
          stream_version,
          event_type,
          schema_version,
          occurred_at,
          actor_kind,
          command_id,
          correlation_id,
          payload
        )
        values (
          ${randomUUID()}::uuid,
          ${syntheticCreateDraftCommand.streamId}::uuid,
          1,
          'case.draft_created',
          1,
          now(),
          'reporter',
          ${randomUUID()}::uuid,
          ${randomUUID()}::uuid,
          '{}'::jsonb
        )
      `,
    ).rejects.toThrow(/append-only/);
  });
});
