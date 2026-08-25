import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  canonicalJson,
  hashCapability,
  hashCommandContent,
  hashesEqual,
  parseCapabilityPepper,
} from "../src/index.js";

const pepper = parseCapabilityPepper(
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
);

describe("capability hashing", () => {
  it("hashes at least 256 bits with a keyed pepper and compares in constant time", () => {
    const capability = randomBytes(32);
    const hash = hashCapability(capability, pepper);

    expect(hash).toHaveLength(32);
    expect(hashesEqual(hash, hashCapability(capability, pepper))).toBe(true);
    expect(
      hashesEqual(
        hash,
        hashCapability(
          capability,
          parseCapabilityPepper(
            "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100",
          ),
        ),
      ),
    ).toBe(false);
  });

  it("rejects a short capability or pepper", () => {
    expect(() => parseCapabilityPepper("00")).toThrow(/32 bytes/);
    expect(() => hashCapability(Buffer.alloc(16), pepper)).toThrow(/256 bits/);
  });
});

describe("command content hashing", () => {
  it("is independent of object key order", () => {
    const left = hashCommandContent({ b: 2, a: 1 });
    const right = hashCommandContent({ a: 1, b: 2 });

    expect(hashesEqual(left, right)).toBe(true);
    expect(canonicalJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(hashesEqual(left, hashCommandContent({ a: 1, b: 3 }))).toBe(false);
  });
});
