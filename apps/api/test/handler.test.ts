import { randomBytes, randomUUID } from "node:crypto";

import {
  createCaseSession,
  createMemoryCaseStore,
} from "@animal-helper/client";
import {
  syntheticAttachFormSnapshotCommand,
  syntheticAttachPrivateDataCommand,
  syntheticCreateDraftCommand,
  syntheticFormSnapshot,
  syntheticSubmitDraftCommand,
} from "@animal-helper/contracts";
import { parseCapabilityPepper } from "@animal-helper/event-store";
import { afterEach, describe, expect, it } from "vitest";

import { createApiHandler, type ApiRequest } from "../src/handler.js";
import { createMemoryGateway } from "../src/memory-gateway.js";
import { createHttpServer } from "../src/server.js";

const pepper = parseCapabilityPepper(
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);
const now = new Date("2026-08-22T12:00:00.000Z");

const authorizationFor = (bytes: Buffer): string =>
  `Capability ${bytes.toString("base64url")}`;

const createHarness = (corsOrigin?: string) => {
  const gateway = createMemoryGateway();
  const handle = createApiHandler({
    gateway,
    pepper,
    now: () => now,
    ...(corsOrigin === undefined ? {} : { corsOrigin }),
  });

  return { gateway, handle };
};

const request = (
  handle: ReturnType<typeof createApiHandler>,
  partial: Partial<ApiRequest> & Pick<ApiRequest, "method" | "pathname">,
) =>
  handle({
    search: "",
    authorization: undefined,
    body: undefined,
    origin: undefined,
    ...partial,
  });

const commandIds = () => ({
  streamId: randomUUID(),
  commandId: randomUUID(),
  correlationId: randomUUID(),
});

describe("API handler", () => {
  it("serves health without a capability", async () => {
    const { handle } = createHarness();
    const response = await request(handle, {
      method: "GET",
      pathname: "/health",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
  });

  it("creates a draft and returns only public status for the capability", async () => {
    const { handle } = createHarness();
    const capability = randomBytes(32);
    const ids = commandIds();
    const created = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticCreateDraftCommand,
        ...ids,
      },
    });

    expect(created.status).toBe(200);
    expect(created.body).toEqual({
      ok: true,
      value: {
        outcome: "applied",
        committedVersion: 1,
        publicState: "draft",
      },
    });
    expect(JSON.stringify(created.body)).not.toContain("eventIds");

    const status = await request(handle, {
      method: "GET",
      pathname: "/status",
      authorization: authorizationFor(capability),
    });

    expect(status.status).toBe(200);
    expect(status.body).toEqual({
      ok: true,
      value: {
        streamId: ids.streamId,
        publicState: "draft",
        createdAt: syntheticCreateDraftCommand.occurredAt,
        updatedAt: syntheticCreateDraftCommand.occurredAt,
      },
    });
  });

  it("attaches private data without echoing it, then makes the case read-only", async () => {
    const { handle } = createHarness();
    const capability = randomBytes(32);
    const ids = commandIds();

    await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: { ...syntheticCreateDraftCommand, ...ids },
    });

    const attached = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticAttachPrivateDataCommand,
        streamId: ids.streamId,
        correlationId: ids.correlationId,
        privateRecordId: randomUUID(),
      },
    });

    expect(attached.status).toBe(200);
    expect(JSON.stringify(attached.body)).not.toContain("synthetic-case-notes");

    const submitted = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticSubmitDraftCommand,
        streamId: ids.streamId,
        correlationId: ids.correlationId,
      },
    });

    expect(submitted.body).toMatchObject({
      ok: true,
      value: { publicState: "received" },
    });

    const status = await request(handle, {
      method: "GET",
      pathname: "/status",
      authorization: authorizationFor(capability),
    });
    expect(status.body).toMatchObject({
      ok: true,
      value: { publicState: "received" },
    });

    const mutateAfterSubmit = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticAttachPrivateDataCommand,
        commandId: randomUUID(),
        streamId: ids.streamId,
        expectedVersion: 3,
        privateRecordId: randomUUID(),
      },
    });

    expect(mutateAfterSubmit).toMatchObject({
      status: 404,
      body: { ok: false, error: { code: "NOT_FOUND" } },
    });
  });

  it("uses the same NOT_FOUND shape for missing, unknown, expired, and wrong-stream access", async () => {
    const { gateway, handle } = createHarness();
    const capability = randomBytes(32);
    const ids = commandIds();

    await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: { ...syntheticCreateDraftCommand, ...ids },
    });

    const missing = await request(handle, {
      method: "GET",
      pathname: "/status",
    });
    const unknown = await request(handle, {
      method: "GET",
      pathname: "/status",
      authorization: authorizationFor(randomBytes(32)),
    });
    const wrongStream = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticAttachPrivateDataCommand,
        streamId: randomUUID(),
        privateRecordId: randomUUID(),
      },
    });

    gateway.expireDraft(ids.streamId, now);
    const expired = await request(handle, {
      method: "GET",
      pathname: "/status",
      authorization: authorizationFor(capability),
    });

    for (const response of [missing, unknown, wrongStream, expired]) {
      expect(response).toMatchObject({
        status: 404,
        body: { ok: false, error: { code: "NOT_FOUND" } },
      });
    }
  });

  it("rejects query strings, malformed capabilities, admin commands, and unknown fields", async () => {
    const { handle } = createHarness();
    const capability = randomBytes(32);

    const query = await request(handle, {
      method: "GET",
      pathname: "/status",
      search: "?capability=secret",
      authorization: authorizationFor(capability),
    });
    const malformed = await request(handle, {
      method: "GET",
      pathname: "/status",
      authorization: `Bearer ${capability.toString("base64url")}`,
    });
    const unknownField = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: { ...syntheticCreateDraftCommand, email: "someone@example.com" },
    });
    const admin = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        type: "start_review",
        schemaVersion: 1,
        commandId: randomUUID(),
        streamId: randomUUID(),
        expectedVersion: 1,
        occurredAt: syntheticCreateDraftCommand.occurredAt,
        correlationId: randomUUID(),
      },
    });

    expect(query).toMatchObject({
      status: 400,
      body: { ok: false, error: { code: "INVALID_REQUEST" } },
    });
    expect(malformed).toMatchObject({
      status: 400,
      body: { ok: false, error: { code: "INVALID_REQUEST" } },
    });
    expect(unknownField).toMatchObject({
      status: 400,
      body: { ok: false, error: { code: "INVALID_REQUEST" } },
    });
    expect(JSON.stringify(unknownField.body)).not.toContain(
      "someone@example.com",
    );
    expect(admin).toMatchObject({
      status: 403,
      body: { ok: false, error: { code: "UNSUPPORTED_COMMAND" } },
    });
  });

  it("accepts an injured/stray form snapshot and rejects deferred situation types", async () => {
    const { handle } = createHarness();
    const capability = randomBytes(32);
    const ids = commandIds();

    await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: { ...syntheticCreateDraftCommand, ...ids },
    });

    const attached = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticAttachFormSnapshotCommand,
        streamId: ids.streamId,
        correlationId: ids.correlationId,
        privateRecordId: randomUUID(),
      },
    });
    expect(attached.status).toBe(200);
    expect(JSON.stringify(attached.body)).not.toContain("domestic_cat");

    const rejected = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticAttachFormSnapshotCommand,
        commandId: randomUUID(),
        streamId: ids.streamId,
        expectedVersion: 2,
        correlationId: ids.correlationId,
        privateRecordId: randomUUID(),
        privatePayload: {
          ...syntheticFormSnapshot,
          situationType: "cruelty",
        },
      },
    });
    expect(rejected).toMatchObject({
      status: 400,
      body: { ok: false, error: { code: "INVALID_REQUEST" } },
    });
  });

  it("maps version conflicts and does not expose event ids on a duplicate retry", async () => {
    const { handle } = createHarness();
    const capability = randomBytes(32);
    const ids = commandIds();
    const createBody = { ...syntheticCreateDraftCommand, ...ids };

    await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: createBody,
    });

    const duplicate = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: createBody,
    });
    expect(duplicate.body).toEqual({
      ok: true,
      value: {
        outcome: "duplicate",
        committedVersion: 1,
        publicState: "draft",
      },
    });

    const conflict = await request(handle, {
      method: "POST",
      pathname: "/commands",
      authorization: authorizationFor(capability),
      body: {
        ...syntheticAttachPrivateDataCommand,
        streamId: ids.streamId,
        expectedVersion: 0,
        privateRecordId: randomUUID(),
      },
    });
    expect(conflict).toMatchObject({
      status: 409,
      body: { ok: false, error: { code: "VERSION_CONFLICT" } },
    });
  });

  it("reflects an exact CORS origin and omits CORS when the origin does not match", async () => {
    const origin = "http://127.0.0.1:5173";
    const { handle } = createHarness(origin);

    const allowed = await request(handle, {
      method: "OPTIONS",
      pathname: "/commands",
      origin,
    });
    const denied = await request(handle, {
      method: "GET",
      pathname: "/health",
      origin: "http://example.com",
    });

    expect(allowed.status).toBe(204);
    expect(allowed.headers["access-control-allow-origin"]).toBe(origin);
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("HTTP adapter", () => {
  const servers: ReturnType<typeof createHttpServer>[] = [];

  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve();
            });
          }),
      ),
    );
  });

  it("parses JSON over loopback HTTP and rejects invalid bodies", async () => {
    const gateway = createMemoryGateway();
    const server = createHttpServer({
      gateway,
      pepper,
      now: () => now,
    });
    servers.push(server);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("expected a TCP listen address");
    }

    const base = `http://127.0.0.1:${address.port}`;
    const capability = randomBytes(32);
    const ids = commandIds();

    const created = await fetch(`${base}/commands`, {
      method: "POST",
      headers: {
        authorization: authorizationFor(capability),
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...syntheticCreateDraftCommand, ...ids }),
    });

    expect(created.status).toBe(200);
    expect(created.headers.get("cache-control")).toBe("no-store");
    await expect(created.json()).resolves.toMatchObject({
      ok: true,
      value: { publicState: "draft" },
    });

    const invalid = await fetch(`${base}/commands`, {
      method: "POST",
      headers: {
        authorization: authorizationFor(capability),
        "content-type": "application/json",
      },
      body: "{",
    });

    expect(invalid.status).toBe(400);
    await expect(invalid.json()).resolves.toEqual({
      ok: false,
      error: { code: "INVALID_REQUEST" },
    });
  });

  it("lets the shared client submit an injured snapshot through the handler", async () => {
    const { handle } = createHarness();
    const session = createCaseSession({
      store: createMemoryCaseStore(),
      transport: {
        sendCommand: async ({ authorization, command }) => {
          const response = await request(handle, {
            method: "POST",
            pathname: "/commands",
            authorization,
            body: command,
          });
          return { status: response.status, body: response.body };
        },
        getStatus: async ({ authorization }) => {
          const response = await request(handle, {
            method: "GET",
            pathname: "/status",
            authorization,
          });
          return { status: response.status, body: response.body };
        },
      },
      now: () => now,
    });

    const opened = await session.openDraft();
    expect(opened.ok).toBe(true);
    const attached = await session.attachFormSnapshot(syntheticFormSnapshot);
    expect(attached.ok).toBe(true);
    const submitted = await session.submit();
    expect(submitted.ok).toBe(true);
    if (!submitted.ok) {
      throw new Error("expected client submit to succeed");
    }

    expect(submitted.value).toMatchObject({
      publicState: "received",
      durability: "received",
      pendingCount: 0,
    });
    expect(JSON.stringify(submitted.value)).not.toContain("domestic_cat");
  });
});
