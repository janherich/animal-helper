import type { Sql } from "postgres";

import { requestHasForbiddenQuery } from "./capability.js";
import { apiError } from "./errors.js";
import { publicGuidanceFor } from "./guidance.js";
import type { ApiRequest, ApiResponse } from "./handler.js";

const etagFor = (hash: string): string => `"${hash}"`;

const matchesEtag = (header: string | undefined, hash: string): boolean => {
  if (header === undefined || header.trim() === "") {
    return false;
  }
  const token = header.trim().replace(/^W\//, "");
  return token === etagFor(hash) || token === hash;
};

export const handlePublicGuidance = async (
  request: ApiRequest,
  sql: Sql | undefined,
  corsOrigin: string | undefined,
): Promise<ApiResponse> => {
  const headers = {
    "cache-control": "no-cache",
    "content-type": "application/json; charset=utf-8",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    ...(corsOrigin === undefined
      ? {}
      : { "access-control-allow-origin": corsOrigin }),
  };

  if (request.method !== "GET") {
    return {
      status: 405,
      headers,
      body: apiError("INVALID_REQUEST"),
    };
  }

  if (requestHasForbiddenQuery(request.search)) {
    return {
      status: 400,
      headers,
      body: apiError("INVALID_REQUEST"),
    };
  }

  const payload = await publicGuidanceFor(sql);
  if (matchesEtag(request.ifNoneMatch, payload.contentHash)) {
    return {
      status: 304,
      headers: { ...headers, etag: etagFor(payload.contentHash) },
      body: null,
    };
  }

  return {
    status: 200,
    headers: { ...headers, etag: etagFor(payload.contentHash) },
    body: payload,
  };
};
