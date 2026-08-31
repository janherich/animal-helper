import { describe, expect, it } from "vitest";

import { loadApiEnv } from "../src/env.js";

const required = {
  DATABASE_URL: "postgres://postgres@127.0.0.1:55432/animal_helper",
  CAPABILITY_PEPPER:
    "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
};

describe("loadApiEnv", () => {
  it("defaults to loopback port 8787 and the Vite customer origin", () => {
    expect(loadApiEnv(required)).toEqual({
      databaseUrl: required.DATABASE_URL,
      capabilityPepper: required.CAPABILITY_PEPPER,
      port: 8787,
      host: "127.0.0.1",
      corsOrigin: "http://127.0.0.1:5173",
    });
  });

  it("disables CORS when API_CORS_ORIGIN is empty", () => {
    expect(
      loadApiEnv({
        ...required,
        API_CORS_ORIGIN: "",
      }),
    ).toEqual({
      databaseUrl: required.DATABASE_URL,
      capabilityPepper: required.CAPABILITY_PEPPER,
      port: 8787,
      host: "127.0.0.1",
    });
  });

  it("reads an exact CORS origin and custom bind address", () => {
    expect(
      loadApiEnv({
        ...required,
        API_PORT: "9000",
        API_HOST: "127.0.0.1",
        API_CORS_ORIGIN: "http://127.0.0.1:5173",
      }),
    ).toMatchObject({
      port: 9000,
      corsOrigin: "http://127.0.0.1:5173",
    });
  });

  it("rejects a missing database URL or an invalid port", () => {
    expect(() =>
      loadApiEnv({ CAPABILITY_PEPPER: required.CAPABILITY_PEPPER }),
    ).toThrow(/DATABASE_URL/);
    expect(() => loadApiEnv({ ...required, API_PORT: "0" })).toThrow(
      /API_PORT/,
    );
  });
});
