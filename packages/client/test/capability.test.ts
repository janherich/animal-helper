import { describe, expect, it } from "vitest";

import {
  CAPABILITY_BYTES,
  capabilityAuthorization,
  capabilityFragment,
  createCapability,
  decodeCapability,
  encodeCapability,
  parseCapabilityFragment,
} from "../src/index.js";

describe("capability", () => {
  it("creates a 256-bit token compatible with the API header parser", () => {
    const capability = createCapability();
    expect(capability.byteLength).toBe(CAPABILITY_BYTES);

    const token = encodeCapability(capability);
    const header = capabilityAuthorization(capability);
    expect(header).toBe(`Capability ${token}`);

    const decoded = Buffer.from(token, "base64url");
    expect(decoded.equals(Buffer.from(capability))).toBe(true);
    expect(decodeCapability(token).ok).toBe(true);
  });

  it("imports a fragment and rejects short tokens", () => {
    const capability = createCapability();
    const fragment = capabilityFragment(capability);
    const parsed = parseCapabilityFragment(fragment);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      throw new Error("expected fragment to parse");
    }

    expect(Buffer.from(parsed.value).equals(Buffer.from(capability))).toBe(
      true,
    );
    expect(parseCapabilityFragment(encodeCapability(capability)).ok).toBe(true);
    expect(parseCapabilityFragment("#c=abc").ok).toBe(false);
    expect(
      parseCapabilityFragment(Buffer.from("too-short").toString("base64url"))
        .ok,
    ).toBe(false);
  });
});
