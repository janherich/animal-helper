import type { Sql } from "postgres";

import {
  listQueueCases,
  OperatorAuthError,
  recordOperatorAudit,
} from "@animal-helper/event-store";

import type { ApiRequest, ApiResponse } from "../handler.js";
import {
  completeAuthentication,
  completeRegistration,
  createAuthenticationOptions,
  createRegistrationOptions,
  readOperatorSession,
  signOutOperator,
} from "./auth.js";
import type { AdminConfig } from "./config.js";
import { clearedSessionCookie, readCookie, sessionCookie } from "./cookies.js";
import {
  adminGuidanceKind,
  adminGuidanceSummary,
  adminPublishGuidance,
  adminSaveGuidanceCell,
  GuidanceAdminError,
} from "./guidance.js";
import { requestOriginIsAllowed } from "./origin.js";

export type AdminHandlerOptions = Readonly<{
  sql: Sql;
  config: AdminConfig;
}>;

type AdminErrorCode =
  | "untrusted_origin"
  | "unauthenticated"
  | "invalid_request"
  | "not_found"
  | "passkey_failed"
  | "passkey_unregistered"
  | "bootstrap_invalid"
  | "method_not_allowed"
  | "conflict"
  | "invalid_content";

type JsonRecord = Record<string, unknown>;

const securityHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
} as const;

const MESSAGES: Record<AdminErrorCode, string> = {
  untrusted_origin: "Request origin is not allowed.",
  unauthenticated: "Sign in required.",
  invalid_request: "The request could not be read.",
  not_found: "Page not found.",
  passkey_failed: "Passkey sign-in could not be completed.",
  passkey_unregistered:
    "No passkey is registered. Run the operator bootstrap command.",
  bootstrap_invalid: "This setup link is invalid or has expired.",
  method_not_allowed: "Method not allowed.",
  conflict: "The draft changed. Reload and try again.",
  invalid_content: "The guidance change is not allowed.",
};

export const handleAdminRequest = async (
  request: ApiRequest,
  options: AdminHandlerOptions,
  now: Date,
): Promise<ApiResponse> => {
  const { sql, config } = options;

  if (request.host !== undefined && request.host !== config.expectedHost) {
    return fail("not_found", 404);
  }

  if (request.search.length > 0) {
    return fail("invalid_request", 400);
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return fail("method_not_allowed", 405);
  }

  if (
    request.method === "POST" &&
    !requestOriginIsAllowed(config.origin, {
      origin: request.origin,
      secFetchSite: request.secFetchSite,
    })
  ) {
    return fail("untrusted_origin", 403);
  }

  const sessionToken = readCookie(request.cookie, config.cookie.name);
  const ceremonyToken = readCookie(request.cookie, config.ceremonyCookie.name);

  try {
    if (
      request.method === "POST" &&
      request.pathname === "/admin/auth/register/options"
    ) {
      const bootstrapToken = readStringField(request.body, "bootstrapToken");
      if (bootstrapToken === undefined) {
        return fail("invalid_request", 400);
      }
      const result = await createRegistrationOptions(
        sql,
        config,
        bootstrapToken,
        now,
      );
      return json(200, { options: result.options }, [
        sessionCookie(
          config.ceremonyCookie,
          result.ceremonyToken,
          config.challengeSeconds,
        ),
      ]);
    }

    if (
      request.method === "POST" &&
      request.pathname === "/admin/auth/register/verify"
    ) {
      if (ceremonyToken === undefined) {
        return fail("unauthenticated", 401);
      }
      const response = readField(request.body, "response");
      if (response === undefined) {
        return fail("invalid_request", 400);
      }
      const result = await completeRegistration(
        sql,
        config,
        ceremonyToken,
        response,
        now,
      );
      return signedIn(result, config);
    }

    if (
      request.method === "POST" &&
      request.pathname === "/admin/auth/login/options"
    ) {
      const result = await createAuthenticationOptions(sql, config, now);
      return json(200, { options: result.options }, [
        sessionCookie(
          config.ceremonyCookie,
          result.ceremonyToken,
          config.challengeSeconds,
        ),
      ]);
    }

    if (
      request.method === "POST" &&
      request.pathname === "/admin/auth/login/verify"
    ) {
      if (ceremonyToken === undefined) {
        return fail("unauthenticated", 401);
      }
      const response = readField(request.body, "response");
      if (response === undefined) {
        return fail("invalid_request", 400);
      }
      const result = await completeAuthentication(
        sql,
        config,
        ceremonyToken,
        response,
        now,
      );
      return signedIn(result, config);
    }

    if (
      request.method === "POST" &&
      request.pathname === "/admin/auth/logout"
    ) {
      await signOutOperator(sql, sessionToken, now);
      return json(204, null, [
        clearedSessionCookie(config.cookie),
        clearedSessionCookie(config.ceremonyCookie),
      ]);
    }

    if (request.method === "GET" && request.pathname === "/admin/session") {
      const session = await readOperatorSession(sql, sessionToken, now);
      if (session === undefined) {
        return fail("unauthenticated", 401, [
          clearedSessionCookie(config.cookie),
        ]);
      }
      return json(200, {
        operator: { id: session.operatorId, email: session.email },
        environment: config.environment,
        expiresAt: session.expiresAt.toISOString(),
      });
    }

    if (request.method === "GET" && request.pathname === "/admin/queue") {
      const session = await readOperatorSession(sql, sessionToken, now);
      if (session === undefined) {
        return fail("unauthenticated", 401);
      }
      const cases = await listQueueCases(sql);
      await recordOperatorAudit(sql, {
        operatorEmail: session.email,
        action: "queue_read",
        outcome: "accepted",
      });
      return json(200, {
        cases: cases.map((item) => ({
          streamId: item.streamId,
          workflowState: item.workflowState,
          hasPrivateData: item.hasPrivateData,
          privateDataPurged: item.privateDataPurged,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
      });
    }

    const guidanceKind =
      /^\/admin\/guidance\/kind\/injured\/([a-z][a-z0-9_]{0,63})$/.exec(
        request.pathname,
      );

    if (request.method === "GET" && request.pathname === "/admin/guidance") {
      const session = await readOperatorSession(sql, sessionToken, now);
      if (session === undefined) {
        return fail("unauthenticated", 401);
      }
      return await adminGuidanceSummary(sql);
    }

    if (request.method === "GET" && guidanceKind !== null) {
      const session = await readOperatorSession(sql, sessionToken, now);
      if (session === undefined) {
        return fail("unauthenticated", 401);
      }
      const kindKey = guidanceKind[1];
      if (kindKey === undefined) {
        return fail("not_found", 404);
      }
      return await adminGuidanceKind(sql, kindKey);
    }

    if (
      request.method === "POST" &&
      request.pathname === "/admin/guidance/cells"
    ) {
      const session = await readOperatorSession(sql, sessionToken, now);
      if (session === undefined) {
        return fail("unauthenticated", 401);
      }
      return await adminSaveGuidanceCell(sql, request.body, session.email, now);
    }

    if (
      request.method === "POST" &&
      request.pathname === "/admin/guidance/publish"
    ) {
      const session = await readOperatorSession(sql, sessionToken, now);
      if (session === undefined) {
        return fail("unauthenticated", 401);
      }
      return await adminPublishGuidance(sql, request.body, session.email, now);
    }
  } catch (error) {
    if (error instanceof OperatorAuthError) {
      return fail(error.code, 401, [
        clearedSessionCookie(config.ceremonyCookie),
      ]);
    }
    const guidanceError = asGuidanceAdminError(error);
    if (guidanceError !== undefined) {
      return fail(guidanceError.code, guidanceError.status);
    }
    throw error;
  }

  return fail("not_found", 404);
};

const asGuidanceAdminError = (
  error: unknown,
): GuidanceAdminError | undefined => {
  if (
    error instanceof Error &&
    error.name === "GuidanceAdminError" &&
    "code" in error &&
    "status" in error &&
    typeof error.status === "number" &&
    (error.code === "conflict" ||
      error.code === "invalid_content" ||
      error.code === "not_found")
  ) {
    return error as GuidanceAdminError;
  }
  return undefined;
};

const signedIn = (
  result: {
    operator: { id: string; email: string };
    expiresAt: string;
    sessionToken: string;
  },
  config: AdminConfig,
): ApiResponse =>
  json(
    200,
    {
      operator: result.operator,
      environment: config.environment,
      expiresAt: result.expiresAt,
    },
    [
      sessionCookie(config.cookie, result.sessionToken, config.sessionSeconds),
      clearedSessionCookie(config.ceremonyCookie),
    ],
  );

const json = (
  status: number,
  body: unknown,
  cookies: readonly string[] = [],
): ApiResponse => ({
  status,
  headers: securityHeaders,
  body,
  ...(cookies.length === 0 ? {} : { cookies }),
});

const fail = (
  code: AdminErrorCode,
  status: number,
  cookies: readonly string[] = [],
): ApiResponse =>
  json(
    status,
    { ok: false, error: { code, message: MESSAGES[code] } },
    cookies,
  );

const readField = (body: unknown, key: string): unknown => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return undefined;
  }
  return (body as JsonRecord)[key];
};

const readStringField = (body: unknown, key: string): string | undefined => {
  const value = readField(body, key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
};
