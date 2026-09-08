import { describe, expect, it } from "vitest";

import { loadAdminConfig } from "../src/admin/config.js";
import { readCookie, sessionCookie } from "../src/admin/cookies.js";
import { requestOriginIsAllowed } from "../src/admin/origin.js";

describe("admin config", () => {
  it("uses a loopback origin and a host-only cookie locally", () => {
    const config = loadAdminConfig({ DATABASE_ENVIRONMENT: "local" });
    expect(config?.origin).toBe("http://localhost:5174");
    expect(config?.rpId).toBe("localhost");
    expect(config?.expectedHost).toBe("localhost:5174");
    expect(config?.cookie.secure).toBe(false);
    expect(config?.cookie.sameSite).toBe("Strict");
    expect(config?.cookie.name.startsWith("ah_dev_admin_")).toBe(true);
    expect(config?.ceremonyCookie.name.endsWith("_ceremony")).toBe(true);
  });

  it("requires https in production and uses a __Host- cookie", () => {
    expect(() =>
      loadAdminConfig({
        DATABASE_ENVIRONMENT: "production",
        ADMIN_ORIGIN: "http://admin.example",
      }),
    ).toThrow(/https/);
    const config = loadAdminConfig({
      DATABASE_ENVIRONMENT: "production",
      ADMIN_ORIGIN: "https://admin.example",
    });
    expect(config?.cookie.name).toBe("__Host-ah_admin");
    expect(config?.cookie.secure).toBe(true);
  });

  it("leaves production admin unconfigured without ADMIN_ORIGIN", () => {
    expect(loadAdminConfig({ DATABASE_ENVIRONMENT: "production" })).toBe(
      undefined,
    );
  });
});

describe("admin cookies and origin policy", () => {
  it("reads and serializes the named cookie", () => {
    const cookie = {
      name: "ah_dev_admin_test",
      secure: false,
      sameSite: "Strict" as const,
    };
    const header = sessionCookie(cookie, "token-value", 1800);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Strict");
    expect(header).not.toContain("Secure");
    expect(readCookie(header, cookie.name)).toBe("token-value");
  });

  it("rejects cross-site POSTs and mismatched origins", () => {
    const origin = "http://127.0.0.1:5174";
    expect(
      requestOriginIsAllowed(origin, { origin, secFetchSite: "same-origin" }),
    ).toBe(true);
    expect(
      requestOriginIsAllowed(origin, {
        origin,
        secFetchSite: "cross-site",
      }),
    ).toBe(false);
    expect(
      requestOriginIsAllowed(origin, {
        origin: "http://127.0.0.1:5173",
        secFetchSite: undefined,
      }),
    ).toBe(false);
  });
});
