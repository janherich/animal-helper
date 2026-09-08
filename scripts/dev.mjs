import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { applyCheckoutLocalEnvironment } from "./local-db-env.mjs";
import { runLocalDatabaseAction } from "./local-db.mjs";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const apiMain = path.join(rootDirectory, "apps", "api", "src", "main.ts");
const stripTypesResolve = pathToFileURL(
  path.join(rootDirectory, "scripts", "strip-types-resolve.mjs"),
).href;

await runLocalDatabaseAction("up", { cwd: rootDirectory });
applyCheckoutLocalEnvironment(rootDirectory, process.env);

const customerDirectory = path.join(rootDirectory, "apps", "customer");
const viteBin = path.join(customerDirectory, "node_modules", ".bin", "vite");

if (!existsSync(viteBin)) {
  throw new Error("Vite is not installed. Run pnpm install.");
}

const api = spawn(
  process.execPath,
  ["--experimental-strip-types", "--import", stripTypesResolve, apiMain],
  {
    cwd: path.join(rootDirectory, "apps", "api"),
    env: { ...process.env, ANIMAL_HELPER_MANAGED: "1" },
    stdio: "inherit",
  },
);

const vite = spawn(viteBin, ["--host", "127.0.0.1", "--port", "5173"], {
  cwd: customerDirectory,
  env: { ...process.env, ANIMAL_HELPER_MANAGED: "1" },
  stdio: "inherit",
});

let shuttingDown = false;

const shutdown = (exitCode) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (api.exitCode === null) {
    api.kill("SIGTERM");
  }

  if (vite.exitCode === null) {
    vite.kill("SIGTERM");
  }

  console.log(
    "Postgres stays running. Stop it with pnpm db:down when you no longer need it.",
  );
  process.exit(exitCode);
};

api.on("exit", (code) => {
  if (shuttingDown) {
    return;
  }

  console.error(`API exited with code ${code ?? "unknown"}.`);
  shutdown(code ?? 1);
});

vite.on("exit", (code) => {
  if (shuttingDown) {
    return;
  }

  console.error(`Vite exited with code ${code ?? "unknown"}.`);
  shutdown(code ?? 1);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log(
  "Press Ctrl+C to stop the API and the customer Vite app. Postgres stays up.",
);
