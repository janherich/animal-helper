import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ensureLocalDbEnvironment,
  loadLocalDbEnvironment,
} from "./local-db-env.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const composeFile = path.join(repositoryRoot, "compose.yaml");
const migrateScript = path.join(scriptDirectory, "migrate-db.mjs");

const usage = `Usage: node scripts/local-db.mjs <init|up|down|destroy|reset|status>

Local persistence is Docker Compose Postgres 16. There is no native-Postgres
fallback. The container stays up when the app stops.

  pnpm db:up       start the container, wait until healthy, apply migrations
  pnpm db:down     stop the container and keep the volume
  pnpm db:status   show Compose status
  pnpm db:reset    destroy the volume, then up
  pnpm db:destroy  stop the container and delete the volume
  pnpm db:migrate  apply migrations to the current DATABASE_URL
`;

export function localComposeArguments(action, environment, envPath) {
  const common = [
    "compose",
    "--env-file",
    envPath,
    "-f",
    composeFile,
    "-p",
    environment.AH_DB_PROJECT,
  ];
  switch (action) {
    case "up":
      return [...common, "up", "-d", "--wait", "--wait-timeout", "60", "db"];
    case "down":
      return [...common, "down", "--remove-orphans"];
    case "destroy":
      return [...common, "down", "--volumes", "--remove-orphans"];
    case "status":
      return [...common, "ps", "db"];
    default:
      throw new Error(`Unsupported local database action: ${action}`);
  }
}

/**
 * @param {'up'|'down'|'destroy'|'reset'|'status'|'init'} action
 * @param {{ cwd?: string, overrides?: Record<string, string>, run?: typeof runCommand }} [options]
 */
export async function runLocalDatabaseAction(action, options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const run = options.run ?? runCommand;
  await ensureLocalDbEnvironment({ cwd, overrides: options.overrides });
  if (action === "init") {
    return;
  }

  const { envPath, environment } = await loadLocalDbEnvironment({ cwd });
  await assertDockerCompose(run, cwd, environment);

  if (action === "reset") {
    stopLegacyNativePostgres(cwd);
    await run(
      "docker",
      localComposeArguments("destroy", environment, envPath),
      {
        cwd,
        environment,
      },
    );
    await startAndMigrate(run, cwd, environment, envPath);
    return;
  }
  if (action === "up") {
    stopLegacyNativePostgres(cwd);
    await startAndMigrate(run, cwd, environment, envPath);
    return;
  }

  await run("docker", localComposeArguments(action, environment, envPath), {
    cwd,
    environment,
  });
}

async function startAndMigrate(run, cwd, environment, envPath) {
  await run("docker", localComposeArguments("up", environment, envPath), {
    cwd,
    environment,
  });
  await run(process.execPath, [migrateScript], { cwd, environment });
}

async function assertDockerCompose(run, cwd, environment) {
  try {
    await run("docker", ["compose", "version"], {
      cwd,
      environment,
      quiet: true,
    });
    await run("docker", ["info", "--format", "{{.ServerVersion}}"], {
      cwd,
      environment,
      quiet: true,
    });
  } catch (error) {
    throw new Error(
      "Local development requires a running Docker Engine with Compose v2 (`docker compose`).",
      { cause: error },
    );
  }
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.environment,
      stdio: options.quiet ? "ignore" : "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with ${signal ?? `code ${code}`}.`));
    });
  });
}

const legacyPgCtlCandidates = [
  "/opt/homebrew/opt/postgresql@16/bin/pg_ctl",
  "/usr/local/opt/postgresql@16/bin/pg_ctl",
];

function stopLegacyNativePostgres(cwd) {
  const dataDirectory = path.join(cwd, ".local", "postgres", "data");
  if (!existsSync(path.join(dataDirectory, "PG_VERSION"))) {
    return;
  }

  const fromEnv =
    process.env.PG_BIN === undefined
      ? undefined
      : path.join(process.env.PG_BIN, "pg_ctl");
  const pgCtl = [fromEnv, ...legacyPgCtlCandidates, "pg_ctl"].find(
    (candidate) => candidate !== undefined && existsSync(candidate),
  );
  if (pgCtl === undefined) {
    console.warn(
      "A leftover native cluster exists in .local/postgres. Stop it if Docker cannot bind the local port.",
    );
    return;
  }

  try {
    execFileSync(pgCtl, ["status", "-D", dataDirectory], { stdio: "ignore" });
  } catch {
    return;
  }

  execFileSync(pgCtl, ["-D", dataDirectory, "-m", "fast", "-w", "stop"], {
    stdio: "inherit",
  });
  console.log(
    "Stopped the leftover native Postgres cluster in .local/postgres.",
  );
}

function parseInitOverrides(args) {
  const definitions = new Map([
    ["--image", "AH_DB_IMAGE"],
    ["--port", "AH_DB_PORT"],
    ["--project", "AH_DB_PROJECT"],
  ]);
  const overrides = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const key = definitions.get(flag);
    const value = args[index + 1];
    if (key === undefined || value === undefined || value === "") {
      throw new Error(
        `Unsupported or incomplete local database option: ${flag ?? ""}`,
      );
    }
    overrides[key] = value;
  }
  return overrides;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const action = process.argv[2] ?? "status";
  const supported = new Set([
    "up",
    "down",
    "destroy",
    "reset",
    "status",
    "init",
  ]);
  if (!supported.has(action)) {
    console.error(usage);
    process.exitCode = 2;
  } else {
    try {
      await runLocalDatabaseAction(action, {
        overrides: parseInitOverrides(process.argv.slice(3)),
      });
      if (action === "init") {
        console.log("Local database environment is ready.");
      }
      if (action === "up" || action === "reset") {
        const { environment } = await loadLocalDbEnvironment({
          cwd: repositoryRoot,
        });
        console.log(
          `Local Postgres is healthy and migrated on 127.0.0.1:${environment.AH_DB_PORT}.`,
        );
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  }
}
