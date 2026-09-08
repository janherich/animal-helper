import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { applyCheckoutLocalEnvironment } from "../src/local-env.js";

describe("applyCheckoutLocalEnvironment", () => {
  it("overrides ambient database URLs from the generated local file", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "ah-local-env-"));
    await mkdir(path.join(cwd, ".local"), { recursive: true });
    await writeFile(
      path.join(cwd, ".local", "db.env"),
      [
        "DATABASE_URL=postgresql://animal_helper:local@127.0.0.1:55432/animal_helper",
        "DATABASE_SSL_MODE=disable",
        "DATABASE_ENVIRONMENT=local",
        "",
      ].join("\n"),
      "utf8",
    );
    await writeFile(
      path.join(cwd, ".env"),
      "DATABASE_URL=postgresql://should-not-win@example.test/db\nKEEP_ME=yes\n",
      "utf8",
    );

    const env: NodeJS.ProcessEnv = {
      DATABASE_URL: "postgresql://production.example/animal_helper",
      DATABASE_SSL_MODE: "verify",
    };
    applyCheckoutLocalEnvironment(cwd, env);

    expect(env.DATABASE_URL).toBe(
      "postgresql://animal_helper:local@127.0.0.1:55432/animal_helper",
    );
    expect(env.DATABASE_SSL_MODE).toBe("disable");
    expect(env.KEEP_ME).toBe("yes");
  });

  it("does not load checkout files in production", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "ah-prod-env-"));
    await mkdir(path.join(cwd, ".local"), { recursive: true });
    await writeFile(
      path.join(cwd, ".local", "db.env"),
      "DATABASE_URL=postgresql://animal_helper:local@127.0.0.1:55432/animal_helper\n",
      "utf8",
    );

    const env: NodeJS.ProcessEnv = {
      DATABASE_ENVIRONMENT: "production",
      DATABASE_URL: "postgresql://neon.example/animal_helper",
    };
    applyCheckoutLocalEnvironment(cwd, env);

    expect(env.DATABASE_URL).toBe("postgresql://neon.example/animal_helper");
  });
});
