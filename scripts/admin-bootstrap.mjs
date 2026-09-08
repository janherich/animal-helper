import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

import {
  applyCheckoutLocalEnvironment,
  ensureLocalDbEnvironment,
  loadLocalDbEnvironment,
} from "./local-db-env.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const bootstrapCli = path.join(
  repositoryRoot,
  "apps",
  "api",
  "src",
  "admin",
  "bootstrap-cli.ts",
);
const stripTypesResolve = pathToFileURL(
  path.join(scriptDirectory, "strip-types-resolve.mjs"),
).href;

const cwd = repositoryRoot;
if (process.env.DATABASE_ENVIRONMENT !== "production") {
  applyCheckoutLocalEnvironment(cwd, process.env);
  if (
    process.env.DATABASE_URL === undefined ||
    process.env.DATABASE_URL.length === 0
  ) {
    await ensureLocalDbEnvironment({ cwd });
    const loaded = await loadLocalDbEnvironment({ cwd });
    Object.assign(process.env, loaded.environment);
  }
}

const child = spawn(
  process.execPath,
  [
    "--experimental-strip-types",
    "--import",
    stripTypesResolve,
    bootstrapCli,
    ...process.argv.slice(2),
  ],
  { cwd, env: process.env, stdio: "inherit" },
);

child.once("exit", (code, signal) => {
  if (code !== 0 && code !== null) {
    process.exitCode = code;
  }
  if (signal !== null) {
    process.exitCode = 1;
  }
});
