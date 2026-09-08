import { describe, expect, it } from "vitest";

import { normalizeOperatorEmail } from "../src/operators.js";

describe("normalizeOperatorEmail", () => {
  it("trims and lowercases a valid address", () => {
    expect(normalizeOperatorEmail("  Ops@Example.INVALID ")).toBe(
      "ops@example.invalid",
    );
  });

  it("rejects empty or malformed addresses", () => {
    expect(() => normalizeOperatorEmail("")).toThrow(/valid operator email/);
    expect(() => normalizeOperatorEmail("not-an-email")).toThrow(
      /valid operator email/,
    );
  });
});
