import { createHash } from "node:crypto";

export const DEFAULT_ADMIN_ORIGIN = "http://localhost:5174";
export const ADMIN_SESSION_SECONDS = 1800;
export const ADMIN_CHALLENGE_SECONDS = 300;
export const ADMIN_RP_NAME = "Animal Helper Administration";

export type AdminCookie = Readonly<{
  name: string;
  secure: boolean;
  sameSite: "Strict";
}>;

export type AdminConfig = Readonly<{
  environment: "local" | "production";
  origin: string;
  rpId: string;
  expectedHost: string;
  rpName: string;
  sessionSeconds: number;
  challengeSeconds: number;
  cookie: AdminCookie;
  ceremonyCookie: AdminCookie;
}>;

export const loadAdminConfig = (
  env: NodeJS.ProcessEnv,
): AdminConfig | undefined => {
  const environment =
    env.DATABASE_ENVIRONMENT === "production" ? "production" : "local";
  const configured = env.ADMIN_ORIGIN?.trim();
  if (
    environment === "production" &&
    (configured === undefined || configured.length === 0)
  ) {
    return undefined;
  }

  const origin =
    configured === undefined || configured.length === 0
      ? DEFAULT_ADMIN_ORIGIN
      : configured;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    throw new Error("ADMIN_ORIGIN must be an exact origin");
  }
  if (url.origin !== origin) {
    throw new Error(
      "ADMIN_ORIGIN must not contain a path, query, or credentials",
    );
  }

  if (environment === "production") {
    if (url.protocol !== "https:") {
      throw new Error("Production ADMIN_ORIGIN must use https");
    }
  } else if (
    url.protocol !== "http:" ||
    (url.hostname !== "127.0.0.1" && url.hostname !== "localhost")
  ) {
    throw new Error("Local ADMIN_ORIGIN must be an HTTP loopback origin");
  }

  const suffix = createHash("sha256").update(origin).digest("hex").slice(0, 10);
  const cookie: AdminCookie = {
    name:
      environment === "production"
        ? "__Host-ah_admin"
        : `ah_dev_admin_${suffix}`,
    secure: environment === "production",
    sameSite: "Strict",
  };

  return {
    environment,
    origin,
    rpId: url.hostname,
    expectedHost: url.host,
    rpName: ADMIN_RP_NAME,
    sessionSeconds: ADMIN_SESSION_SECONDS,
    challengeSeconds: ADMIN_CHALLENGE_SECONDS,
    cookie,
    ceremonyCookie: { ...cookie, name: `${cookie.name}_ceremony` },
  };
};
