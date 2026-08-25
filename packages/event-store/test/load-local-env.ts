import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const loadEnvFile = (filePath: string): void => {
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

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
loadEnvFile(path.join(repositoryRoot, ".env"));
loadEnvFile(path.join(repositoryRoot, ".local/postgres/env"));
