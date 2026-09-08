import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  applyCheckoutLocalEnvironment,
  checkoutIdentity,
  createLocalDbEnvironment,
  deriveIntegrationDatabaseUrl,
  ensureLocalDbEnvironment,
  loadLocalDbEnvironment,
  resolveIntegrationDatabaseUrl,
} from "./local-db-env.mjs";

const passwordFrom = (random) => random(24).toString("base64url");

describe("local database environment", () => {
  it("creates a loopback Docker environment and never rewrites it", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "ah-db-env-"));
    try {
      const first = await ensureLocalDbEnvironment({
        cwd: directory,
        overrides: { AH_DB_PORT: "5517", AH_DB_PROJECT: "ah-test-worktree" },
        random: Buffer.alloc.bind(Buffer),
      });
      const generated = await readFile(first, "utf8");
      await writeFile(first, `${generated}KEEP_ME=yes\n`);

      const again = await ensureLocalDbEnvironment({
        cwd: directory,
        overrides: { AH_DB_PORT: "9999" },
      });
      const kept = await readFile(again, "utf8");
      assert.match(kept, /KEEP_ME=yes/);
      assert.match(kept, /AH_DB_PORT=5517/);
      assert.doesNotMatch(kept, /AH_DB_PORT=9999/);

      const { environment } = await loadLocalDbEnvironment({
        cwd: directory,
        baseEnv: {
          DATABASE_URL: "postgresql://production.example/animal_helper",
          DATABASE_SSL_MODE: "verify",
          KEEP_UNRELATED: "yes",
        },
      });
      assert.equal(environment.KEEP_UNRELATED, "yes");
      assert.equal(environment.DATABASE_SSL_MODE, "disable");
      assert.equal(environment.ADMIN_ORIGIN, "http://localhost:5174");
      assert.equal(
        environment.DATABASE_URL,
        `postgresql://animal_helper:${passwordFrom(Buffer.alloc.bind(Buffer))}@127.0.0.1:5517/animal_helper`,
      );
      assert.equal(
        environment.DATABASE_TEST_URL,
        `postgresql://animal_helper:${passwordFrom(Buffer.alloc.bind(Buffer))}@127.0.0.1:5517/animal_helper_test`,
      );
      assert.equal(
        environment.DATABASE_MIGRATION_URL,
        environment.DATABASE_URL,
      );
      assert.equal(environment.AH_DB_PROJECT, "ah-test-worktree");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("derives stable but distinct Compose projects per checkout", () => {
    const first = createLocalDbEnvironment(
      "/tmp/animal-helper-worktrees/feature-one",
      {},
      Buffer.alloc.bind(Buffer),
    );
    const repeated = createLocalDbEnvironment(
      "/tmp/animal-helper-worktrees/feature-one",
      {},
      Buffer.alloc.bind(Buffer),
    );
    const second = createLocalDbEnvironment(
      "/tmp/animal-helper-worktrees/feature-two",
      {},
      Buffer.alloc.bind(Buffer),
    );
    assert.equal(first.AH_DB_PROJECT, repeated.AH_DB_PROJECT);
    assert.notEqual(first.AH_DB_PROJECT, second.AH_DB_PROJECT);
    assert.equal(
      first.AH_DB_PROJECT,
      checkoutIdentity("/tmp/animal-helper-worktrees/feature-one").project,
    );
    assert.throws(
      () =>
        createLocalDbEnvironment("/tmp/animal-helper", {
          AH_DB_PROJECT: "invalid project\nINJECTED=value",
        }),
      /Compose project name/,
    );
    assert.throws(
      () =>
        createLocalDbEnvironment("/tmp/animal-helper", {
          ADMIN_ORIGIN: "https://admin.example",
        }),
      /HTTP localhost origin/,
    );
    assert.throws(
      () =>
        createLocalDbEnvironment("/tmp/animal-helper", {
          API_CORS_ORIGIN: "https://app.example",
        }),
      /HTTP localhost origin/,
    );
  });

  it("does not apply local files when DATABASE_ENVIRONMENT is production", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "ah-db-prod-"));
    try {
      await ensureLocalDbEnvironment({ cwd: directory });
      const env = {
        DATABASE_ENVIRONMENT: "production",
        DATABASE_URL: "postgresql://neon.example/animal_helper",
      };
      applyCheckoutLocalEnvironment(directory, env);
      assert.equal(env.DATABASE_URL, "postgresql://neon.example/animal_helper");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("derives a sibling integration database and refuses the app database", () => {
    const appUrl =
      "postgresql://animal_helper:local@127.0.0.1:55432/animal_helper";
    assert.equal(
      deriveIntegrationDatabaseUrl(appUrl),
      "postgresql://animal_helper:local@127.0.0.1:55432/animal_helper_test",
    );
    assert.equal(
      resolveIntegrationDatabaseUrl({ DATABASE_URL: appUrl }),
      "postgresql://animal_helper:local@127.0.0.1:55432/animal_helper_test",
    );
    assert.equal(
      resolveIntegrationDatabaseUrl({
        DATABASE_ENVIRONMENT: "production",
        DATABASE_URL: appUrl,
      }),
      undefined,
    );
    assert.equal(
      resolveIntegrationDatabaseUrl({
        DATABASE_URL:
          "postgresql://animal_helper:local@neon.example/animal_helper",
      }),
      undefined,
    );
    assert.throws(
      () =>
        resolveIntegrationDatabaseUrl({
          DATABASE_URL: appUrl,
          DATABASE_TEST_URL: appUrl,
        }),
      /must end with _test/,
    );
    const testUrl = deriveIntegrationDatabaseUrl(appUrl);
    assert.throws(
      () =>
        resolveIntegrationDatabaseUrl({
          DATABASE_URL: testUrl,
          DATABASE_TEST_URL: testUrl,
        }),
      /different database/,
    );
  });
});
