import { describe, expect, it } from "vitest";

import { bootstrapTokenFromHash } from "../src/bootstrap-hash.js";

describe("backoffice bootstrap hash", () => {
  it("reads a one-time setup token and ignores empty hashes", () => {
    expect(bootstrapTokenFromHash("#bootstrap=secret-token")).toBe(
      "secret-token",
    );
    expect(bootstrapTokenFromHash("#other=1")).toBeUndefined();
    expect(bootstrapTokenFromHash("")).toBeUndefined();
  });
});
