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

const spawnVite = (appName, port, host = "127.0.0.1") => {
  const appDirectory = path.join(rootDirectory, "apps", appName);
  const viteBin = path.join(appDirectory, "node_modules", ".bin", "vite");
  if (!existsSync(viteBin)) {
    throw new Error("Vite is not installed. Run pnpm install.");
  }
  return spawn(viteBin, ["--host", host, "--port", String(port)], {
    cwd: appDirectory,
    env: { ...process.env, ANIMAL_HELPER_MANAGED: "1" },
    stdio: "inherit",
  });
};

const api = spawn(
  process.execPath,
  ["--experimental-strip-types", "--import", stripTypesResolve, apiMain],
  {
    cwd: path.join(rootDirectory, "apps", "api"),
    env: { ...process.env, ANIMAL_HELPER_MANAGED: "1" },
    stdio: "inherit",
  },
);

const customer = spawnVite("customer", 5173);
const backoffice = spawnVite("backoffice", 5174, "localhost");
const children = [api, customer, backoffice];

let shuttingDown = false;

const shutdown = (exitCode) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
    }
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

customer.on("exit", (code) => {
  if (shuttingDown) {
    return;
  }

  console.error(`Customer Vite exited with code ${code ?? "unknown"}.`);
  shutdown(code ?? 1);
});

backoffice.on("exit", (code) => {
  if (shuttingDown) {
    return;
  }

  console.error(`Backoffice Vite exited with code ${code ?? "unknown"}.`);
  shutdown(code ?? 1);
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log(
  "Customer: http://127.0.0.1:5173  Backoffice: http://localhost:5174",
);
console.log("Press Ctrl+C to stop the API and Vite apps. Postgres stays up.");
