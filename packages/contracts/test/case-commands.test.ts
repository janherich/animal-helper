import { describe, expect, it } from "vitest";

import {
  parseApiErrorBody,
  parseCaseCommand,
  parseCommandAcceptedBody,
  parsePublicCaseStatusBody,
  syntheticAttachContactCommand,
  syntheticAttachLocationCommand,
  syntheticAttachPrivateDataCommand,
  syntheticCaseCommands,
  syntheticCreateDraftCommand,
  toDomainCaseCommand,
} from "../src/index.js";

describe("case command contracts", () => {
  it("accepts synthetic fixtures and strips private payloads from domain commands", () => {
    for (const fixture of syntheticCaseCommands) {
      const parsed = parseCaseCommand(fixture);
      expect(parsed.success).toBe(true);
      if (!parsed.success) {
        throw new Error("expected fixture to parse");
      }

      const domain = toDomainCaseCommand(parsed.data);
      expect(JSON.stringify(domain)).not.toContain("synthetic-case-notes");
      expect(domain).not.toHaveProperty("privatePayload");
    }
  });

  it("rejects unknown fields at the write boundary", () => {
    const parsed = parseCaseCommand({
      ...syntheticCreateDraftCommand,
      email: "someone@example.com",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects an oversized private payload", () => {
    const parsed = parseCaseCommand({
      ...syntheticAttachPrivateDataCommand,
      privatePayload: {
        syntheticNotes: "x".repeat(20_000),
      },
    });

    expect(parsed.success).toBe(false);
  });

  it("maps attach commands to opaque domain references", () => {
    const parsed = parseCaseCommand(syntheticAttachPrivateDataCommand);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error("expected attach fixture to parse");
    }

    expect(toDomainCaseCommand(parsed.data)).toEqual({
      type: "attach_private_data",
      privateRecordId: syntheticAttachPrivateDataCommand.privateRecordId,
      kind: "text",
    });
  });

  it("accepts versioned location and contact payloads for the happy path", () => {
    expect(parseCaseCommand(syntheticAttachLocationCommand).success).toBe(true);
    expect(parseCaseCommand(syntheticAttachContactCommand).success).toBe(true);
    expect(
      parseCaseCommand({
        ...syntheticAttachContactCommand,
        privatePayload: {
          ...syntheticAttachContactCommand.privatePayload,
          email: "not-an-email",
        },
      }).success,
    ).toBe(false);
  });

  it("parses command and status envelopes without private fields", () => {
    expect(
      parseCommandAcceptedBody({
        ok: true,
        value: {
          outcome: "applied",
          committedVersion: 1,
          publicState: "draft",
        },
      }).success,
    ).toBe(true);
    expect(
      parsePublicCaseStatusBody({
        ok: true,
        value: {
          streamId: syntheticCreateDraftCommand.streamId,
          publicState: "draft",
          createdAt: syntheticCreateDraftCommand.occurredAt,
          updatedAt: syntheticCreateDraftCommand.occurredAt,
        },
      }).success,
    ).toBe(true);
    expect(
      parseApiErrorBody({
        ok: false,
        error: { code: "VERSION_CONFLICT" },
      }).success,
    ).toBe(true);
    expect(
      parseCommandAcceptedBody({
        ok: true,
        value: {
          outcome: "applied",
          committedVersion: 1,
          publicState: "draft",
          eventIds: ["secret"],
        },
      }).success,
    ).toBe(false);
  });
});
