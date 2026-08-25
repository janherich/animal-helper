import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const postgresScript = path.join(
  rootDirectory,
  "scripts",
  "local-postgres.mjs",
);
const apiMain = path.join(rootDirectory, "apps", "api", "src", "main.ts");
const stripTypesResolve = pathToFileURL(
  path.join(rootDirectory, "scripts", "strip-types-resolve.mjs"),
).href;

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

execFileSync(process.execPath, [postgresScript, "start"], {
  stdio: "inherit",
});

loadEnvFile(path.join(rootDirectory, ".env"));
loadEnvFile(path.join(rootDirectory, ".local", "postgres", "env"));

const api = spawn(
  process.execPath,
  ["--experimental-strip-types", "--import", stripTypesResolve, apiMain],
  {
    cwd: path.join(rootDirectory, "apps", "api"),
    env: { ...process.env, ANIMAL_HELPER_MANAGED: "1" },
    stdio: "inherit",
  },
);

let shuttingDown = false;

const stopPostgres = () => {
  execFileSync(process.execPath, [postgresScript, "stop"], {
    stdio: "inherit",
  });
};

const shutdown = (exitCode) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  clearInterval(postgresCheck);

  if (api.exitCode === null) {
    api.kill("SIGTERM");
  }

  try {
    stopPostgres();
  } catch (error) {
    console.error(error);
  }

  process.exit(exitCode);
};

const postgresCheck = setInterval(() => {
  try {
    execFileSync(process.execPath, [postgresScript, "status"], {
      stdio: "ignore",
    });
  } catch {
    console.error(
      "Local Postgres stopped unexpectedly. See .local/postgres/postgres.log.",
    );
    shutdown(1);
  }
}, 2000);

api.on("exit", (code) => {
  if (shuttingDown) {
    return;
  }

  console.error(`API exited with code ${code ?? "unknown"}.`);
  shutdown(code ?? 1);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Press Ctrl+C to stop Postgres and the API.");
