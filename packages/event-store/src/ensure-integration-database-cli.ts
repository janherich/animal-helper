import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensureIntegrationDatabase } from "./integration-database.js";
import { applyCheckoutLocalEnvironment } from "./local-env.js";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

applyCheckoutLocalEnvironment(repositoryRoot, process.env);
const testUrl = await ensureIntegrationDatabase(process.env);
if (testUrl === undefined) {
  console.log("Integration test database was not created.");
} else {
  console.log("Integration test database is ready.");
}
