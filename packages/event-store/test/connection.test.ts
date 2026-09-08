import { describe, expect, it } from "vitest";

import {
  assertDatabaseUrlDoesNotOverrideTls,
  createSqlOptions,
  resolveDatabaseUrl,
  resolveMigrationUrl,
  resolveSslMode,
} from "../src/connection.js";

const localUrl =
  "postgresql://animal_helper:secret@127.0.0.1:55432/animal_helper";

describe("database connection policy", () => {
  it("defaults to verified TLS and forbids URL TLS parameters", () => {
    expect(resolveSslMode({})).toBe("verify");
    expect(() =>
      assertDatabaseUrlDoesNotOverrideTls(`${localUrl}?sslmode=require`),
    ).toThrow(/DATABASE_SSL_MODE/);
    expect(() =>
      resolveDatabaseUrl({ DATABASE_URL: "https://example.test/db" }),
    ).toThrow(/postgres or postgresql/);
  });

  it("requires verified TLS in production", () => {
    expect(() =>
      resolveSslMode({
        DATABASE_ENVIRONMENT: "production",
        DATABASE_SSL_MODE: "disable",
      }),
    ).toThrow(/verified TLS/);
    expect(() =>
      resolveSslMode({
        DATABASE_ENVIRONMENT: "production",
        DATABASE_SSL_MODE: "require",
      }),
    ).toThrow(/verified TLS/);
    expect(
      resolveSslMode({
        DATABASE_ENVIRONMENT: "production",
        DATABASE_SSL_MODE: "verify",
      }),
    ).toBe("verify");
  });

  it("prefers the direct migration URL when present", () => {
    expect(
      resolveMigrationUrl({
        DATABASE_URL: "postgresql://pool.example/animal_helper",
        DATABASE_MIGRATION_URL: "postgresql://direct.example/animal_helper",
      }),
    ).toBe("postgresql://direct.example/animal_helper");
  });

  it("builds postgres.js options from the explicit SSL mode", () => {
    expect(
      createSqlOptions({
        DATABASE_SSL_MODE: "disable",
        DATABASE_POOL_SIZE: "2",
      }),
    ).toMatchObject({ max: 2, ssl: false });
    expect(createSqlOptions({ DATABASE_SSL_MODE: "require" })).toMatchObject({
      ssl: { rejectUnauthorized: false },
    });
    const verified = createSqlOptions(
      { DATABASE_SSL_MODE: "verify" },
      { max: 1 },
    );
    expect(verified.max).toBe(1);
    expect(verified.ssl).toEqual({ rejectUnauthorized: true });
    expect(typeof verified.onnotice).toBe("function");
  });
});
