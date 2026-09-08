import { existsSync, lstatSync, readFileSync } from "node:fs";
import path from "node:path";

export const LOCAL_DB_ENV_RELATIVE = path.join(".local", "db.env");

export const LOCAL_DB_KEYS = [
  "AH_DB_IMAGE",
  "AH_DB_NAME",
  "AH_DB_PASSWORD",
  "AH_DB_PORT",
  "AH_DB_PROJECT",
  "AH_DB_USER",
  "ADMIN_ORIGIN",
  "API_CORS_ORIGIN",
  "API_HOST",
  "API_PORT",
  "CAPABILITY_PEPPER",
  "DATABASE_ENVIRONMENT",
  "DATABASE_MIGRATION_URL",
  "DATABASE_POOL_SIZE",
  "DATABASE_SSL_MODE",
  "DATABASE_URL",
] as const;

const LOCAL_DB_KEY_SET = new Set<string>(LOCAL_DB_KEYS);

/**
 * Apply `.local/db.env` when present. Production checkouts never load local
 * files. Protected keys override ambient values so a leaked production URL
 * cannot be used by accident. `.env` only fills keys that are still unset.
 */
export const applyCheckoutLocalEnvironment = (
  repositoryRoot: string,
  env: NodeJS.ProcessEnv = process.env,
): void => {
  if (env.DATABASE_ENVIRONMENT === "production") {
    return;
  }

  const root = path.resolve(repositoryRoot);
  applyEnvFile(path.join(root, LOCAL_DB_ENV_RELATIVE), env, LOCAL_DB_KEY_SET);
  applyEnvFile(path.join(root, ".env"), env, new Set());
};

const applyEnvFile = (
  filePath: string,
  env: NodeJS.ProcessEnv,
  overrideKeys: Set<string>,
): void => {
  if (!existsSync(filePath)) {
    return;
  }

  if (lstatSync(filePath).isSymbolicLink()) {
    throw new Error(`Refusing symbolic environment file: ${filePath}`);
  }

  const fileEnvironment = parseEnvironment(readFileSync(filePath, "utf8"));
  for (const key of overrideKeys) {
    Reflect.deleteProperty(env, key);
  }

  for (const [key, value] of Object.entries(fileEnvironment)) {
    if (overrideKeys.has(key) || env[key] === undefined) {
      env[key] = value;
    }
  }
};

export const parseEnvironment = (source: string): Record<string, string> => {
  const environment: Record<string, string> = {};

  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator <= 0) {
      throw new Error(
        `Invalid local database environment entry on line ${index + 1}`,
      );
    }

    const key = line.slice(0, separator);
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      throw new Error(
        `Invalid local database environment key on line ${index + 1}`,
      );
    }

    environment[key] = line.slice(separator + 1);
  }

  return environment;
};
