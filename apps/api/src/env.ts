import { applyCheckoutLocalEnvironment } from "@animal-helper/event-store";

export type ApiEnv = Readonly<{
  databaseUrl: string;
  capabilityPepper: string;
  port: number;
  host: string;
  corsOrigin?: string;
}>;

export const loadLocalEnvFiles = (repositoryRoot: string): void => {
  applyCheckoutLocalEnvironment(repositoryRoot, process.env);
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

  const host =
    env.API_HOST === undefined || env.API_HOST.length === 0
      ? "127.0.0.1"
      : env.API_HOST;

  const configuredCors = env.API_CORS_ORIGIN;
  const corsOrigin =
    configuredCors === undefined
      ? host === "127.0.0.1"
        ? "http://127.0.0.1:5173"
        : undefined
      : configuredCors.length === 0
        ? undefined
        : configuredCors;

  return {
    databaseUrl,
    capabilityPepper,
    port,
    host,
    ...(corsOrigin === undefined ? {} : { corsOrigin }),
  };
};
