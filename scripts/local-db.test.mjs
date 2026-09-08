import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { loadLocalDbEnvironment } from "./local-db-env.mjs";
import { localComposeArguments, runLocalDatabaseAction } from "./local-db.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

describe("local database lifecycle", () => {
  it("binds Postgres only to loopback with readiness and a named volume", async () => {
    const compose = await readFile(
      path.join(repositoryRoot, "compose.yaml"),
      "utf8",
    );
    assert.match(compose, /127\.0\.0\.1:\$\{AH_DB_PORT\}:5432/);
    assert.match(compose, /pg_isready/);
    assert.match(compose, /db-data:\/var\/lib\/postgresql\/data/);
    assert.doesNotMatch(compose, /container_name:/);
    assert.doesNotMatch(compose, /restart:\s*always/);
    assert.doesNotMatch(compose, /docker-entrypoint-initdb\.d/);
  });

  it("starts Compose, waits for health, then migrates", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "ah-db-up-"));
    const calls = [];
    const run = async (command, args, options) => {
      calls.push({ command, args, quiet: options.quiet ?? false });
    };
    try {
      await runLocalDatabaseAction("up", { cwd: directory, run });
      assert.deepEqual(
        calls.map(({ command }) => command),
        ["docker", "docker", "docker", process.execPath],
      );
      assert.deepEqual(calls[0].args, ["compose", "version"]);
      assert.equal(calls[0].quiet, true);
      assert.deepEqual(calls[1].args, [
        "info",
        "--format",
        "{{.ServerVersion}}",
      ]);
      assert.deepEqual(calls[2].args.slice(-6), [
        "up",
        "-d",
        "--wait",
        "--wait-timeout",
        "60",
        "db",
      ]);
      assert.match(calls[3].args[0], /scripts\/migrate-db\.mjs$/);

      const { envPath, environment } = await loadLocalDbEnvironment({
        cwd: directory,
      });
      const destroy = localComposeArguments("destroy", environment, envPath);
      assert.deepEqual(destroy.slice(-3), [
        "down",
        "--volumes",
        "--remove-orphans",
      ]);
      assert.ok(destroy.includes(environment.AH_DB_PROJECT));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("fails clearly when Docker Compose is unavailable", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "ah-db-no-docker-"));
    try {
      await assert.rejects(
        runLocalDatabaseAction("status", {
          cwd: directory,
          run: async () => {
            throw new Error("ENOENT");
          },
        }),
        /requires a running Docker Engine with Compose v2/,
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
