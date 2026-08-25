import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Sql } from "postgres";

export const defaultMigrationsDirectory = path.resolve(
  fileURLToPath(new URL("../../../supabase/migrations", import.meta.url)),
);

export const applyMigrations = async (
  sql: Sql,
  migrationsDirectory: string = defaultMigrationsDirectory,
): Promise<void> => {
  const files = (await readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    await sql.file(path.join(migrationsDirectory, file));
  }
};
