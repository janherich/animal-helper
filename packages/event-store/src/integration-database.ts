import postgres from "postgres";

import {
  createSqlOptions,
  databaseTarget,
  isLoopbackHostname,
  readDatabaseName,
  replaceDatabaseName,
  resolveDatabaseUrl,
} from "./connection.js";

export const INTEGRATION_DATABASE_SUFFIX = "_test";

const DUPLICATE_DATABASE = "42P04";

export const deriveIntegrationDatabaseUrl = (
  connectionString: string,
): string => {
  const database = readDatabaseName(connectionString, "DATABASE_URL");
  if (database.endsWith(INTEGRATION_DATABASE_SUFFIX)) {
    throw new Error(
      "DATABASE_URL already points at the integration test database",
    );
  }
  return replaceDatabaseName(
    connectionString,
    `${database}${INTEGRATION_DATABASE_SUFFIX}`,
    "DATABASE_URL",
  );
};

export const resolveIntegrationDatabaseUrl = (
  env: NodeJS.ProcessEnv,
): string | undefined => {
  if (env.DATABASE_ENVIRONMENT === "production") {
    return undefined;
  }

  const primary = env.DATABASE_URL?.trim();
  if (primary === undefined || primary.length === 0) {
    return undefined;
  }

  const configured = env.DATABASE_TEST_URL?.trim();
  const testUrl =
    configured === undefined || configured.length === 0
      ? deriveIntegrationDatabaseUrl(primary)
      : configured;

  const testDatabase = readDatabaseName(testUrl, "DATABASE_TEST_URL");
  if (!testDatabase.endsWith(INTEGRATION_DATABASE_SUFFIX)) {
    throw new Error("DATABASE_TEST_URL database name must end with _test");
  }

  const app = databaseTarget(primary, "DATABASE_URL");
  if (!isLoopbackHostname(app.host)) {
    return undefined;
  }

  const integration = databaseTarget(testUrl, "DATABASE_TEST_URL");
  if (!isLoopbackHostname(integration.host)) {
    throw new Error("DATABASE_TEST_URL must be loopback Postgres");
  }
  if (
    app.host === integration.host &&
    app.port === integration.port &&
    app.database === integration.database
  ) {
    throw new Error(
      "DATABASE_TEST_URL must be a different database than DATABASE_URL",
    );
  }

  return testUrl;
};

export const ensureIntegrationDatabase = async (
  env: NodeJS.ProcessEnv,
): Promise<string | undefined> => {
  const testUrl = resolveIntegrationDatabaseUrl(env);
  if (testUrl === undefined) {
    return undefined;
  }

  const primary = resolveDatabaseUrl(env);
  const testDatabase = readDatabaseName(testUrl, "DATABASE_TEST_URL");
  const sql = postgres(primary, createSqlOptions(env, { max: 1 }));
  try {
    const [row] = await sql<{ exists: boolean }[]>`
      select exists(
        select 1 from pg_database where datname = ${testDatabase}
      ) as exists
    `;
    if (row?.exists === true) {
      return testUrl;
    }

    try {
      await sql.unsafe(`CREATE DATABASE ${testDatabase}`).simple();
    } catch (error) {
      if (postgresErrorCode(error) !== DUPLICATE_DATABASE) {
        throw error;
      }
    }
  } finally {
    await sql.end();
  }

  return testUrl;
};

const postgresErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  return typeof error.code === "string" ? error.code : undefined;
};
