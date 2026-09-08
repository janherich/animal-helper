import { describe, expect, it } from "vitest";

import {
  deriveIntegrationDatabaseUrl,
  resolveIntegrationDatabaseUrl,
} from "../src/integration-database.js";

const appUrl =
  "postgresql://animal_helper:secret@127.0.0.1:55432/animal_helper";
const testUrl =
  "postgresql://animal_helper:secret@127.0.0.1:55432/animal_helper_test";

describe("integration database URL", () => {
  it("derives a sibling _test database on the same host", () => {
    expect(deriveIntegrationDatabaseUrl(appUrl)).toBe(testUrl);
  });

  it("prefers DATABASE_TEST_URL when it is a different _test database", () => {
    expect(
      resolveIntegrationDatabaseUrl({
        DATABASE_URL: appUrl,
        DATABASE_TEST_URL:
          "postgresql://animal_helper:secret@127.0.0.1:55432/cases_test",
      }),
    ).toBe("postgresql://animal_helper:secret@127.0.0.1:55432/cases_test");
  });

  it("does not resolve a production, hosted, or missing URL", () => {
    expect(
      resolveIntegrationDatabaseUrl({
        DATABASE_ENVIRONMENT: "production",
        DATABASE_URL: appUrl,
      }),
    ).toBeUndefined();
    expect(resolveIntegrationDatabaseUrl({})).toBeUndefined();
    expect(
      resolveIntegrationDatabaseUrl({
        DATABASE_URL:
          "postgresql://animal_helper:secret@neon.example/animal_helper",
      }),
    ).toBeUndefined();
  });

  it("rejects a test URL that targets the application database", () => {
    expect(() =>
      resolveIntegrationDatabaseUrl({
        DATABASE_URL: appUrl,
        DATABASE_TEST_URL: appUrl,
      }),
    ).toThrow(/must end with _test/);
    expect(() =>
      resolveIntegrationDatabaseUrl({
        DATABASE_URL: testUrl,
        DATABASE_TEST_URL: testUrl,
      }),
    ).toThrow(/different database/);
    expect(() => deriveIntegrationDatabaseUrl(testUrl)).toThrow(
      /already points/,
    );
    expect(() =>
      resolveIntegrationDatabaseUrl({
        DATABASE_URL: appUrl,
        DATABASE_TEST_URL:
          "postgresql://animal_helper:secret@neon.example/animal_helper_test",
      }),
    ).toThrow(/loopback Postgres/);
  });
});
