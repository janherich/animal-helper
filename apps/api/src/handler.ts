import {
  parseCapabilityHeader,
  requestHasForbiddenQuery,
} from "./capability.js";
import { apiError, statusForError } from "./errors.js";
import type { ApiGateway } from "./gateway.js";
import { handleCommand } from "./handle-command.js";
import { handleStatus } from "./handle-status.js";

export type ApiRequest = Readonly<{
  method: string;
  pathname: string;
  search: string;
  authorization: string | undefined;
  body: unknown;
  origin: string | undefined;
}>;

export type ApiResponse = Readonly<{
  status: number;
  headers: Readonly<Record<string, string>>;
  body: unknown;
}>;

export type ApiHandlerOptions = Readonly<{
  gateway: ApiGateway;
  pepper: Buffer;
  now?: () => Date;
  corsOrigin?: string;
}>;

const securityHeaders = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
} as const;

const withHeaders = (
  status: number,
  body: unknown,
  corsOrigin: string | undefined,
): ApiResponse => ({
  status,
  headers: {
    ...securityHeaders,
    ...(corsOrigin === undefined
      ? {}
      : { "access-control-allow-origin": corsOrigin }),
  },
  body,
});

const errorResponse = (
  code: Parameters<typeof apiError>[0],
  corsOrigin: string | undefined,
) => withHeaders(statusForError(code), apiError(code), corsOrigin);

export const createApiHandler = (options: ApiHandlerOptions) => {
  const now = options.now ?? (() => new Date());

  return async (request: ApiRequest): Promise<ApiResponse> => {
    const corsOrigin =
      options.corsOrigin !== undefined && request.origin === options.corsOrigin
        ? options.corsOrigin
        : undefined;

    if (request.method === "OPTIONS") {
      return {
        status: 204,
        headers: {
          ...securityHeaders,
          ...(corsOrigin === undefined
            ? {}
            : {
                "access-control-allow-origin": corsOrigin,
                "access-control-allow-headers": "authorization, content-type",
                "access-control-allow-methods": "GET, POST, OPTIONS",
              }),
        },
        body: null,
      };
    }

    if (request.method === "GET" && request.pathname === "/health") {
      return withHeaders(200, { ok: true }, corsOrigin);
    }

    if (
      (request.pathname === "/commands" || request.pathname === "/status") &&
      requestHasForbiddenQuery(request.search)
    ) {
      return errorResponse("INVALID_REQUEST", corsOrigin);
    }

    if (request.method === "GET" && request.pathname === "/status") {
      const capability = parseCapabilityHeader(request.authorization);
      if (!capability.ok) {
        return errorResponse(
          capability.error === "invalid" ? "INVALID_REQUEST" : "NOT_FOUND",
          corsOrigin,
        );
      }

      const body = await handleStatus(
        capability.value,
        options.gateway,
        options.pepper,
        now(),
      );
      return withHeaders(
        body.ok ? 200 : statusForError(body.error.code),
        body,
        corsOrigin,
      );
    }

    if (request.method === "POST" && request.pathname === "/commands") {
      const capability = parseCapabilityHeader(request.authorization);
      if (!capability.ok) {
        return errorResponse(
          capability.error === "invalid" ? "INVALID_REQUEST" : "NOT_FOUND",
          corsOrigin,
        );
      }

      const body = await handleCommand(
        request.body,
        capability.value,
        options.gateway,
        options.pepper,
        now(),
      );
      return withHeaders(
        body.ok ? 200 : statusForError(body.error.code),
        body,
        corsOrigin,
      );
    }

    return errorResponse("NOT_FOUND", corsOrigin);
  };
};
