import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import { apiError } from "./errors.js";
import type { ApiHandlerOptions } from "./handler.js";
import { createApiHandler } from "./handler.js";

const MAX_BODY_BYTES = 20_480;

const headerValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const readBody = async (
  request: IncomingMessage,
): Promise<{ ok: true; value: unknown } | { ok: false }> => {
  request.setEncoding("utf8");
  let body = "";

  for await (const chunk of request) {
    if (typeof chunk !== "string") {
      return { ok: false };
    }

    body += chunk;
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return { ok: false };
    }
  }

  if (body.length === 0) {
    return { ok: true, value: undefined };
  }

  try {
    return { ok: true, value: JSON.parse(body) as unknown };
  } catch {
    return { ok: false };
  }
};

export const createHttpServer = (options: ApiHandlerOptions) => {
  const handle = createApiHandler(options);

  return createServer((request: IncomingMessage, response: ServerResponse) => {
    void (async () => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const body = await readBody(request);
      const origin = headerValue(request.headers.origin);
      const result = body.ok
        ? await handle({
            method: request.method ?? "GET",
            pathname: url.pathname,
            search: url.search,
            authorization: headerValue(request.headers.authorization),
            body: body.value,
            origin,
          })
        : await handle({
            method: request.method ?? "GET",
            pathname: url.pathname,
            search: url.search,
            authorization: headerValue(request.headers.authorization),
            body: undefined,
            origin,
          }).then((parsed) => ({
            status: 400,
            headers: parsed.headers,
            body: apiError("INVALID_REQUEST"),
          }));

      response.writeHead(result.status, result.headers);
      response.end(
        result.body === null ? undefined : JSON.stringify(result.body),
      );
    })().catch(() => {
      if (!response.headersSent) {
        response.writeHead(500, { "cache-control": "no-store" });
      }

      response.end();
    });
  });
};
