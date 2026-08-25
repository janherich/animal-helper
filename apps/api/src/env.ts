import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type ApiEnv = Readonly<{
  databaseUrl: string;
  capabilityPepper: string;
  port: number;
  host: string;
  corsOrigin?: string;
}>;

export const loadEnvFile = (filePath: string): void => {
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

export const loadLocalEnvFiles = (repositoryRoot: string): void => {
  loadEnvFile(path.join(repositoryRoot, ".env"));
  loadEnvFile(path.join(repositoryRoot, ".local/postgres/env"));
};

export const loadApiEnv = (env: NodeJS.ProcessEnv): ApiEnv => {
  const databaseUrl = env.DATABASE_URL;
  const capabilityPepper = env.CAPABILITY_PEPPER;

  if (databaseUrl === undefined || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is required");
  }

  if (capabilityPepper === undefined || capabilityPepper.length === 0) {
    throw new Error("CAPABILITY_PEPPER is required");
  }

  const port = Number(env.API_PORT ?? "8787");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("API_PORT must be an integer between 1 and 65535");
  }

  const corsOrigin = env.API_CORS_ORIGIN;
  const host =
    env.API_HOST === undefined || env.API_HOST.length === 0
      ? "127.0.0.1"
      : env.API_HOST;

  return {
    databaseUrl,
    capabilityPepper,
    port,
    host,
    ...(corsOrigin === undefined || corsOrigin.length === 0
      ? {}
      : { corsOrigin }),
  };
};
