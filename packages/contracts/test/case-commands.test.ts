import { describe, expect, it } from "vitest";

import {
  parseCaseCommand,
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
});
