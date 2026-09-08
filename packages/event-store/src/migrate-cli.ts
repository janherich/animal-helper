import postgres from "postgres";

import { createSqlOptions, resolveMigrationUrl } from "./connection.js";
import { applyMigrations, defaultMigrationsDirectory } from "./migrations.js";

const databaseUrl = resolveMigrationUrl(process.env);
const sql = postgres(databaseUrl, createSqlOptions(process.env, { max: 1 }));

try {
  await applyMigrations(sql, defaultMigrationsDirectory);
  console.log("Database migrations are up to date.");
} finally {
  await sql.end();
}
