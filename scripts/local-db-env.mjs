import { createHash, randomBytes } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import { chmod, lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const LOCAL_DB_ENV_RELATIVE = path.join(".local", "db.env");

export const LOCAL_CAPABILITY_PEPPER =
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

export const LOCAL_DB_KEYS = new Set([
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
  "DATABASE_TEST_URL",
  "DATABASE_URL",
]);

/**
 * Create one private, checkout-local database environment. Existing files are
 * never rewritten so local credentials stay stable across restarts.
 *
 * @param {{ cwd?: string, overrides?: Record<string, string>, random?: typeof randomBytes }} [options]
 */
export async function ensureLocalDbEnvironment(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const envPath = path.join(cwd, LOCAL_DB_ENV_RELATIVE);
  try {
    const metadata = await lstat(envPath);
    if (metadata.isSymbolicLink()) {
      throw new Error(
        `Refusing symbolic local database environment: ${envPath}`,
      );
    }
    await readFile(envPath, "utf8");
    await chmod(envPath, 0o600);
    return envPath;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await mkdir(path.dirname(envPath), { recursive: true });
  const generated = createLocalDbEnvironment(
    cwd,
    options.overrides,
    options.random,
  );
  await writeFile(envPath, serializeEnvironment(generated), {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  await chmod(envPath, 0o600);
  return envPath;
}

/**
 * Load the generated local environment. Protected database values override
 * ambient shell values so a local command cannot migrate a production database.
 *
 * @param {{ cwd?: string, baseEnv?: NodeJS.ProcessEnv }} [options]
 */
export async function loadLocalDbEnvironment(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const envPath = path.join(cwd, LOCAL_DB_ENV_RELATIVE);
  const fileEnvironment = parseEnvironment(await readFile(envPath, "utf8"));
  const environment = { ...(options.baseEnv ?? process.env) };
  for (const key of LOCAL_DB_KEYS) {
    Reflect.deleteProperty(environment, key);
  }
  return { envPath, environment: { ...environment, ...fileEnvironment } };
}

/**
 * Apply `.local/db.env` when present. Does nothing in production, and does not
 * create the file. `.env` can fill keys that are still unset.
 *
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} [env]
 */
export function applyCheckoutLocalEnvironment(cwd, env = process.env) {
  if (env.DATABASE_ENVIRONMENT === "production") {
    return;
  }

  const repositoryRoot = path.resolve(cwd);
  applyEnvFile(path.join(repositoryRoot, LOCAL_DB_ENV_RELATIVE), env, {
    overrideKeys: LOCAL_DB_KEYS,
  });
  applyEnvFile(path.join(repositoryRoot, ".env"), env, {
    overrideKeys: new Set(),
  });
}

/**
 * @param {string} cwd
 * @param {Record<string, string>} [overrides]
 * @param {typeof randomBytes} [random]
 */
export function createLocalDbEnvironment(
  cwd,
  overrides = {},
  random = randomBytes,
) {
  const identity = checkoutIdentity(cwd);
  const port = validatedPort(overrides.AH_DB_PORT ?? "55432", "AH_DB_PORT");
  const database = overrides.AH_DB_NAME ?? "animal_helper";
  const user = overrides.AH_DB_USER ?? "animal_helper";
  const password = overrides.AH_DB_PASSWORD ?? random(24).toString("base64url");
  const corsOrigin = overrides.API_CORS_ORIGIN ?? "http://127.0.0.1:5173";
  const adminOrigin = overrides.ADMIN_ORIGIN ?? "http://localhost:5174";
  const apiPort = validatedPort(overrides.API_PORT ?? "8787", "API_PORT");
  const project = overrides.AH_DB_PROJECT ?? identity.project;
  assertComposeProject(project);
  assertLocalAppOrigin(corsOrigin, "API_CORS_ORIGIN");
  assertLocalAppOrigin(adminOrigin, "ADMIN_ORIGIN");
  const connectionUrl = new URL("postgresql://127.0.0.1");
  connectionUrl.username = user;
  connectionUrl.password = password;
  connectionUrl.port = port;
  connectionUrl.pathname = `/${database}`;
  const appUrl = connectionUrl.toString();

  return {
    AH_DB_IMAGE: overrides.AH_DB_IMAGE ?? "postgres:16-alpine",
    AH_DB_NAME: database,
    AH_DB_PASSWORD: password,
    AH_DB_PORT: port,
    AH_DB_PROJECT: project,
    AH_DB_USER: user,
    ADMIN_ORIGIN: adminOrigin,
    API_CORS_ORIGIN: corsOrigin,
    API_HOST: "127.0.0.1",
    API_PORT: apiPort,
    CAPABILITY_PEPPER: overrides.CAPABILITY_PEPPER ?? LOCAL_CAPABILITY_PEPPER,
    DATABASE_ENVIRONMENT: "local",
    DATABASE_MIGRATION_URL: appUrl,
    DATABASE_POOL_SIZE: overrides.DATABASE_POOL_SIZE ?? "8",
    DATABASE_SSL_MODE: "disable",
    DATABASE_TEST_URL: deriveIntegrationDatabaseUrl(appUrl),
    DATABASE_URL: appUrl,
  };
}

const SQL_DATABASE_NAME = /^[a-z][a-z0-9_]*$/;
const INTEGRATION_DATABASE_SUFFIX = "_test";

/** @param {string} connectionString @param {string} [name] */
export function readDatabaseName(connectionString, name = "DATABASE_URL") {
  let databaseUrl;
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
  const database = decodeURIComponent(
    databaseUrl.pathname.replace(/^\/+/, ""),
  ).replace(/\/+$/, "");
  if (database.length === 0 || database.includes("/")) {
    throw new Error(`${name} must point at one database`);
  }
  if (!SQL_DATABASE_NAME.test(database)) {
    throw new Error(`${name} database name must be a lowercase SQL identifier`);
  }
  return database;
}

/** @param {string} connectionString */
export function deriveIntegrationDatabaseUrl(connectionString) {
  const database = readDatabaseName(connectionString, "DATABASE_URL");
  if (database.endsWith(INTEGRATION_DATABASE_SUFFIX)) {
    throw new Error(
      "DATABASE_URL already points at the integration test database",
    );
  }
  const databaseUrl = new URL(connectionString);
  databaseUrl.pathname = `/${database}${INTEGRATION_DATABASE_SUFFIX}`;
  return databaseUrl.toString();
}

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @returns {string | undefined}
 */
export function resolveIntegrationDatabaseUrl(env) {
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
  const appDatabase = readDatabaseName(primary, "DATABASE_URL");
  const appUrl = new URL(primary);
  if (
    appUrl.hostname !== "127.0.0.1" &&
    appUrl.hostname !== "localhost" &&
    !appUrl.hostname.endsWith(".localhost")
  ) {
    return undefined;
  }
  const integrationUrl = new URL(testUrl);
  if (
    integrationUrl.hostname !== "127.0.0.1" &&
    integrationUrl.hostname !== "localhost" &&
    !integrationUrl.hostname.endsWith(".localhost")
  ) {
    throw new Error("DATABASE_TEST_URL must be loopback Postgres");
  }
  const appPort = appUrl.port === "" ? "5432" : appUrl.port;
  const testPort = integrationUrl.port === "" ? "5432" : integrationUrl.port;
  if (
    appUrl.hostname === integrationUrl.hostname &&
    appPort === testPort &&
    appDatabase === testDatabase
  ) {
    throw new Error(
      "DATABASE_TEST_URL must be a different database than DATABASE_URL",
    );
  }
  return testUrl;
}

/** @param {string} project */
export function assertComposeProject(project) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(project)) {
    throw new Error("AH_DB_PROJECT must be a lowercase Compose project name.");
  }
}

/** @param {string} origin @param {string} name */
function assertLocalAppOrigin(origin, name) {
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error(`${name} must be one exact local app origin.`);
  }
  const localHostname =
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "localhost" ||
    parsed.hostname.endsWith(".localhost");
  if (
    parsed.protocol !== "http:" ||
    !localHostname ||
    parsed.origin !== origin
  ) {
    throw new Error(`${name} must be one exact HTTP localhost origin.`);
  }
}

/** @param {string} cwd */
export function checkoutIdentity(cwd) {
  const basename = path.basename(cwd);
  const slug = basename
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
  const digest = createHash("sha256")
    .update(path.resolve(cwd), "utf8")
    .digest("hex")
    .slice(0, 10);
  const prefix = (slug || "animal-helper").slice(0, 36).replace(/-+$/g, "");
  return { digest, project: `ah-${prefix}-${digest}` };
}

/** @param {string} rawPort @param {string} name */
function validatedPort(rawPort, name) {
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return String(port);
}

/** @param {Record<string, string>} environment */
export function serializeEnvironment(environment) {
  for (const [key, value] of Object.entries(environment)) {
    if (value.includes("\n") || value.includes("\r")) {
      throw new Error(
        `Local database environment value ${key} must stay on one line.`,
      );
    }
  }
  const lines = [
    "# Generated local database environment. Do not commit or share this file.",
    ...Object.entries(environment).map(([key, value]) => `${key}=${value}`),
  ];
  return `${lines.join("\n")}\n`;
}

/** @param {string} source */
export function parseEnvironment(source) {
  const environment = {};
  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator <= 0) {
      throw new Error(
        `Invalid local database environment entry on line ${index + 1}.`,
      );
    }
    const key = line.slice(0, separator);
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      throw new Error(
        `Invalid local database environment key on line ${index + 1}.`,
      );
    }
    environment[key] = line.slice(separator + 1);
  }
  return environment;
}

/**
 * @param {string} filePath
 * @param {NodeJS.ProcessEnv} env
 * @param {{ overrideKeys: Set<string> }} options
 */
function applyEnvFile(filePath, env, options) {
  let source;
  try {
    const metadata = lstatSync(filePath);
    if (metadata.isSymbolicLink()) {
      throw new Error(`Refusing symbolic environment file: ${filePath}`);
    }
    source = readFileSync(filePath, "utf8");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }

  const fileEnvironment = parseEnvironment(source);
  for (const key of options.overrideKeys) {
    Reflect.deleteProperty(env, key);
  }
  for (const [key, value] of Object.entries(fileEnvironment)) {
    if (options.overrideKeys.has(key) || env[key] === undefined) {
      env[key] = value;
    }
  }
}
