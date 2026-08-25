import { describe, expect, it } from "vitest";

import {
  parseCaseCommand,
  parseFormSnapshot,
  syntheticAttachFormSnapshotCommand,
  syntheticFormSnapshot,
  toDomainCaseCommand,
} from "../src/index.js";

describe("injured/stray form snapshot v1", () => {
  it("accepts the synthetic happy-path snapshot and strips it from the domain command", () => {
    const parsed = parseCaseCommand(syntheticAttachFormSnapshotCommand);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error("expected form snapshot fixture to parse");
    }

    if (parsed.data.type !== "attach_private_data") {
      throw new Error("expected attach command");
    }

    expect(parsed.data.kind).toBe("form_snapshot");
    expect(toDomainCaseCommand(parsed.data)).toEqual({
      type: "attach_private_data",
      privateRecordId: syntheticAttachFormSnapshotCommand.privateRecordId,
      kind: "form_snapshot",
    });
    expect(JSON.stringify(toDomainCaseCommand(parsed.data))).not.toContain(
      "domestic_cat",
    );
  });

  it("rejects deferred situation types and unidentified species without a kind", () => {
    expect(
      parseFormSnapshot({
        ...syntheticFormSnapshot,
        situationType: "cruelty",
      }).success,
    ).toBe(false);
    expect(
      parseFormSnapshot({
        ...syntheticFormSnapshot,
        species: { source: "manual" },
      }).success,
    ).toBe(false);
  });

  it("rejects unknown combined with other symptoms, and other without text", () => {
    expect(
      parseFormSnapshot({
        ...syntheticFormSnapshot,
        condition: {
          symptoms: ["unknown", "bleeding"],
          conscious: "yes",
          isJuvenile: "no",
        },
      }).success,
    ).toBe(false);
    expect(
      parseFormSnapshot({
        ...syntheticFormSnapshot,
        condition: {
          symptoms: ["other"],
          conscious: "yes",
          isJuvenile: "no",
        },
      }).success,
    ).toBe(false);
    expect(
      parseFormSnapshot({
        ...syntheticFormSnapshot,
        condition: {
          symptoms: ["other"],
          otherText: "synthetic-other-injury",
          conscious: "unknown",
          isJuvenile: "unknown",
        },
      }).success,
    ).toBe(true);
  });

  it("rejects extra fields and a skipped-photo snapshot is still valid", () => {
    expect(
      parseFormSnapshot({
        ...syntheticFormSnapshot,
        email: "someone@example.com",
      }).success,
    ).toBe(false);
    expect(
      parseFormSnapshot({
        schemaVersion: 1,
        situationType: "stray",
        species: { source: "skipped" },
        condition: { symptoms: [] },
        mediaRecordIds: [],
      }).success,
    ).toBe(true);
  });
});
