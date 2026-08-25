import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const stateDirectory = path.join(rootDirectory, ".local", "postgres");
const dataDirectory = path.join(stateDirectory, "data");
const logFile = path.join(stateDirectory, "postgres.log");
const envFile = path.join(stateDirectory, "env");
const migrationsDirectory = path.join(rootDirectory, "supabase", "migrations");

const host = "127.0.0.1";
const port = "55432";
const user = "postgres";
const database = "animal_helper";
const databaseUrl = `postgres://${user}@${host}:${port}/${database}`;
const capabilityPepper =
  "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

const homebrewBinaries = [
  "/opt/homebrew/opt/postgresql@16/bin",
  "/usr/local/opt/postgresql@16/bin",
  "/opt/homebrew/bin",
  "/usr/local/bin",
  "/usr/lib/postgresql/16/bin",
];

const usage = `Usage: node scripts/local-postgres.mjs <start|stop|status> [--wait]

Starts an isolated Postgres 16 cluster in .local/postgres. It does not use
Supabase and does not touch a system-wide cluster on port 5432.

  npm run dev        start Postgres, migrate, and the HTTP API
  npm run dev:stop   stop the local cluster
`;

const run = (binary, args, options = {}) => {
  try {
    return execFileSync(binary, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    }).trim();
  } catch (error) {
    const detail =
      error instanceof Error && "stderr" in error
        ? String(error.stderr || error.message)
        : String(error);
    throw new Error(`${binary} ${args.join(" ")}\n${detail}`, { cause: error });
  }
};

const tryRun = (binary, args) => {
  try {
    return run(binary, args);
  } catch {
    return undefined;
  }
};

const findBinaryDirectory = () => {
  if (process.env.PG_BIN !== undefined && existsSync(process.env.PG_BIN)) {
    return process.env.PG_BIN;
  }

  const fromConfig = tryRun("pg_config", ["--bindir"]);
  if (fromConfig !== undefined && existsSync(path.join(fromConfig, "pg_ctl"))) {
    return fromConfig;
  }

  const fromPath = tryRun("/bin/sh", ["-c", "command -v pg_ctl"]);
  if (fromPath !== undefined) {
    return path.dirname(fromPath);
  }

  const match = homebrewBinaries.find((directory) =>
    existsSync(path.join(directory, "pg_ctl")),
  );

  if (match !== undefined) {
    return match;
  }

  throw new Error(
    "Could not find Postgres 16 tools (pg_ctl). Install PostgreSQL 16 or set PG_BIN to its bin directory.",
  );
};

const binaries = () => {
  const directory = findBinaryDirectory();

  return {
    directory,
    createdb: path.join(directory, "createdb"),
    pgCtl: path.join(directory, "pg_ctl"),
    pgIsReady: path.join(directory, "pg_isready"),
    postgres: path.join(directory, "postgres"),
    psql: path.join(directory, "psql"),
  };
};

const connectionArgs = ["-h", host, "-p", port, "-U", user];

const isReady = (tools) => {
  try {
    run(tools.pgIsReady, ["-h", host, "-p", port, "-d", database]);
    return true;
  } catch {
    return false;
  }
};

const isClusterRunning = (tools) => {
  try {
    run(tools.pgCtl, ["status", "-D", dataDirectory]);
    return true;
  } catch {
    return false;
  }
};

const writeEnvFiles = () => {
  mkdirSync(stateDirectory, { recursive: true });
  const contents = [
    `DATABASE_URL=${databaseUrl}`,
    `CAPABILITY_PEPPER=${capabilityPepper}`,
    "API_HOST=127.0.0.1",
    "API_PORT=8787",
    "",
  ].join("\n");

  writeFileSync(envFile, contents);

  const dotenvPath = path.join(rootDirectory, ".env");
  if (!existsSync(dotenvPath)) {
    writeFileSync(dotenvPath, contents);
  }
};

const ensureCluster = (tools) => {
  if (existsSync(path.join(dataDirectory, "PG_VERSION"))) {
    return;
  }

  mkdirSync(stateDirectory, { recursive: true });
  run(path.join(tools.directory, "initdb"), [
    "-D",
    dataDirectory,
    "-U",
    user,
    "--auth-local=trust",
    "--auth-host=trust",
    "--encoding=UTF8",
    "--locale=C",
  ]);
};

const startCluster = (tools) => {
  ensureCluster(tools);

  if (isClusterRunning(tools)) {
    return;
  }

  run(tools.pgCtl, [
    "-D",
    dataDirectory,
    "-l",
    logFile,
    "-o",
    `-p ${port} -k ${stateDirectory} -c listen_addresses=${host}`,
    "-w",
    "start",
  ]);
};

const ensureDatabase = (tools) => {
  try {
    run(tools.psql, [...connectionArgs, "-d", "postgres", "-c", "select 1"]);
  } catch (error) {
    throw new Error(
      `Postgres started but is not accepting connections on ${host}:${port}.`,
      { cause: error },
    );
  }

  const databases = run(tools.psql, [
    ...connectionArgs,
    "-d",
    "postgres",
    "-At",
    "-c",
    `select 1 from pg_database where datname = '${database}'`,
  ]);

  if (databases !== "1") {
    run(tools.createdb, [...connectionArgs, database]);
  }
};

const applyMigrations = (tools) => {
  run(tools.psql, [
    ...connectionArgs,
    "-d",
    database,
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    "create table if not exists public.schema_migrations (filename text primary key, applied_at timestamptz not null default now())",
  ]);

  const applied = new Set(
    run(tools.psql, [
      ...connectionArgs,
      "-d",
      database,
      "-At",
      "-c",
      "select filename from public.schema_migrations",
    ])
      .split("\n")
      .filter((name) => name.length > 0),
  );

  const files = readdirSync(migrationsDirectory)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    run(tools.psql, [
      ...connectionArgs,
      "-d",
      database,
      "-v",
      "ON_ERROR_STOP=1",
      "-f",
      path.join(migrationsDirectory, file),
    ]);
    run(tools.psql, [
      ...connectionArgs,
      "-d",
      database,
      "-c",
      `insert into public.schema_migrations (filename) values ('${file}')`,
    ]);
  }
};

const printReady = (tools) => {
  const version = run(tools.postgres, ["--version"]);
  console.log(`${version}`);
  console.log(`Listening on ${host}:${port}`);
  console.log(`DATABASE_URL=${databaseUrl}`);
  console.log("Event-store database is ready.");
};

const start = ({ wait }) => {
  const tools = binaries();
  startCluster(tools);
  ensureDatabase(tools);
  applyMigrations(tools);
  writeEnvFiles();
  printReady(tools);

  if (!wait) {
    return;
  }

  console.log("Press Ctrl+C to stop.");

  const shutdown = () => {
    stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  setInterval(() => {
    if (!isReady(tools)) {
      console.error(
        "Local Postgres stopped unexpectedly. See .local/postgres/postgres.log.",
      );
      process.exit(1);
    }
  }, 2000);
};

const stop = () => {
  const tools = binaries();

  if (!existsSync(dataDirectory) || !isClusterRunning(tools)) {
    console.log("Local Postgres is not running.");
    return;
  }

  run(tools.pgCtl, ["-D", dataDirectory, "-m", "fast", "-w", "stop"]);
  console.log("Local Postgres stopped.");
};

const status = () => {
  const tools = binaries();
  if (isReady(tools)) {
    console.log(`Local Postgres is ready at ${databaseUrl}`);
    return;
  }

  console.log("Local Postgres is not running. Start it with npm run dev.");
  process.exitCode = 1;
};

const command = process.argv[2];
const wait = process.argv.includes("--wait");

switch (command) {
  case "start":
    start({ wait });
    break;
  case "stop":
    stop();
    break;
  case "status":
    status();
    break;
  default:
    console.error(usage);
    process.exit(1);
}
