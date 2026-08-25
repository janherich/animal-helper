import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  parseCapabilityHeader,
  requestHasForbiddenQuery,
} from "../src/capability.js";

describe("parseCapabilityHeader", () => {
  it("accepts a case-insensitive Capability token of at least 256 bits", () => {
    const bytes = randomBytes(32);
    const parsed = parseCapabilityHeader(
      `capability ${bytes.toString("base64url")}`,
    );

    expect(parsed).toEqual({ ok: true, value: bytes });
  });

  it("treats a missing header as missing, not malformed", () => {
    expect(parseCapabilityHeader(undefined)).toEqual({
      ok: false,
      error: "missing",
    });
    expect(parseCapabilityHeader("")).toEqual({ ok: false, error: "missing" });
  });

  it("rejects Bearer, short tokens, and extra fields", () => {
    const token = randomBytes(32).toString("base64url");

    expect(parseCapabilityHeader(`Bearer ${token}`)).toEqual({
      ok: false,
      error: "invalid",
    });
    expect(
      parseCapabilityHeader(
        `Capability ${randomBytes(16).toString("base64url")}`,
      ),
    ).toEqual({ ok: false, error: "invalid" });
    expect(parseCapabilityHeader(`Capability ${token} extra`)).toEqual({
      ok: false,
      error: "invalid",
    });
  });
});

describe("requestHasForbiddenQuery", () => {
  it("rejects any non-empty query string", () => {
    expect(requestHasForbiddenQuery("")).toBe(false);
    expect(requestHasForbiddenQuery("?")).toBe(false);
    expect(requestHasForbiddenQuery("?capability=secret")).toBe(true);
  });
});
