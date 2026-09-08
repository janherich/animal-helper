export type DatabaseSslMode = "disable" | "require" | "verify";

export type SqlClientOptions = {
  max: number;
  onnotice: () => void;
  ssl: false | { rejectUnauthorized: boolean };
};

const TLS_PARAMETERS = new Set([
  "ssl",
  "sslcert",
  "sslkey",
  "sslmode",
  "sslnegotiation",
  "sslrootcert",
  "uselibpqcompat",
]);

export const assertDatabaseUrlDoesNotOverrideTls = (
  connectionString: string,
  name: string = "DATABASE_URL",
): void => {
  let databaseUrl: URL;
  try {
    databaseUrl = new URL(connectionString);
  } catch {
    throw new Error(`${name} must be a PostgreSQL URL`);
  }

  if (
    databaseUrl.protocol !== "postgres:" &&
    databaseUrl.protocol !== "postgresql:"
  ) {
    throw new Error(`${name} must use the postgres or postgresql scheme`);
  }

  for (const parameter of databaseUrl.searchParams.keys()) {
    if (TLS_PARAMETERS.has(parameter.toLowerCase())) {
      throw new Error(`${name} must not override TLS; use DATABASE_SSL_MODE`);
    }
  }
};

export const resolveSslMode = (env: NodeJS.ProcessEnv): DatabaseSslMode => {
  const configured = env.DATABASE_SSL_MODE?.trim();
  const mode =
    configured === undefined || configured.length === 0 ? "verify" : configured;

  if (mode !== "disable" && mode !== "require" && mode !== "verify") {
    throw new Error("DATABASE_SSL_MODE must be disable, require, or verify");
  }

  if (env.DATABASE_ENVIRONMENT === "production" && mode !== "verify") {
    throw new Error(
      "Production database connections require verified TLS (DATABASE_SSL_MODE=verify)",
    );
  }

  return mode;
};

export const resolveDatabaseUrl = (env: NodeJS.ProcessEnv): string => {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (databaseUrl === undefined || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is required");
  }

  assertDatabaseUrlDoesNotOverrideTls(databaseUrl, "DATABASE_URL");
  return databaseUrl;
};

export const resolveMigrationUrl = (env: NodeJS.ProcessEnv): string => {
  const configured = env.DATABASE_MIGRATION_URL?.trim();
  if (configured !== undefined && configured.length > 0) {
    assertDatabaseUrlDoesNotOverrideTls(configured, "DATABASE_MIGRATION_URL");
    return configured;
  }

  return resolveDatabaseUrl(env);
};

export const createSqlOptions = (
  env: NodeJS.ProcessEnv,
  overrides: { max?: number } = {},
): SqlClientOptions => {
  const poolSize = Number(env.DATABASE_POOL_SIZE ?? "8");
  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 20) {
    throw new Error("DATABASE_POOL_SIZE must be an integer between 1 and 20");
  }

  const mode = resolveSslMode(env);
  return {
    max: overrides.max ?? poolSize,
    onnotice: () => undefined,
    ssl: mode === "disable" ? false : { rejectUnauthorized: mode === "verify" },
  };
};
