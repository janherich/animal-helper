import path from "node:path";

import postgres from "postgres";

import { parseCapabilityPepper } from "@animal-helper/event-store";

import { loadApiEnv, loadLocalEnvFiles } from "./env.js";
import { createPostgresGateway } from "./gateway.js";
import { createHttpServer } from "./server.js";

loadLocalEnvFiles(path.resolve(import.meta.dirname, "../../.."));

const env = loadApiEnv(process.env);
const sql = postgres(env.databaseUrl, { max: 8, onnotice: () => undefined });
const server = createHttpServer({
  gateway: createPostgresGateway(sql),
  pepper: parseCapabilityPepper(env.capabilityPepper),
  ...(env.corsOrigin === undefined ? {} : { corsOrigin: env.corsOrigin }),
});

server.on("error", (error) => {
  console.error(error);
  void sql.end().finally(() => process.exit(1));
});

server.listen(env.port, env.host, () => {
  console.log(`API listening on http://${env.host}:${env.port}`);
});

const shutdown = () => {
  server.close(() => {
    void sql.end().finally(() => process.exit(0));
  });
};

process.on("SIGTERM", shutdown);
if (process.env.ANIMAL_HELPER_MANAGED === "1") {
  process.on("SIGINT", () => undefined);
} else {
  process.on("SIGINT", shutdown);
}
