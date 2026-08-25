import { describe, expect, it } from "vitest";

import {
  capabilityAllowsMutation,
  capabilityAllowsStatusRead,
  type StoredCapability,
} from "../src/index.js";

const now = new Date("2026-08-22T12:00:00.000Z");

const capability = (
  overrides: Partial<StoredCapability> = {},
): StoredCapability => ({
  streamId: "018f1a50-7c3b-7000-8000-000000000001",
  mutationAllowed: true,
  expiresAt: new Date("2026-09-21T12:00:00.000Z"),
  ...overrides,
});

describe("capability access", () => {
  it("allows draft mutation and status before expiry", () => {
    const draft = capability();
    expect(capabilityAllowsMutation(draft, now)).toBe(true);
    expect(capabilityAllowsStatusRead(draft, now)).toBe(true);
  });

  it("allows only status after submission", () => {
    const submitted = capability({
      mutationAllowed: false,
      expiresAt: null,
    });
    expect(capabilityAllowsMutation(submitted, now)).toBe(false);
    expect(capabilityAllowsStatusRead(submitted, now)).toBe(true);
  });

  it("denies expired drafts", () => {
    const expired = capability({
      mutationAllowed: false,
      expiresAt: now,
    });
    expect(capabilityAllowsMutation(expired, now)).toBe(false);
    expect(capabilityAllowsStatusRead(expired, now)).toBe(false);
  });
});
