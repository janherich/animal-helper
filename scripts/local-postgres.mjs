import path from "node:path";
import { fileURLToPath } from "node:url";

import { runLocalDatabaseAction } from "./local-db.mjs";

const usage = `scripts/local-postgres.mjs is replaced by Docker Compose Postgres.

  pnpm db:up       start the container, wait until healthy, apply migrations
  pnpm db:down     stop the container and keep the volume
  pnpm db:status   show Compose status
  pnpm db:reset    destroy the volume, then up
`;

const command = process.argv[2];
const mapped =
  command === "start" ? "up" : command === "stop" ? "down" : command;

if (mapped !== "up" && mapped !== "down" && mapped !== "status") {
  console.error(usage);
  process.exitCode = 1;
} else {
  console.warn(
    "scripts/local-postgres.mjs is deprecated; use pnpm db:up, pnpm db:down, or pnpm db:status.",
  );
  try {
    await runLocalDatabaseAction(mapped, {
      cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
