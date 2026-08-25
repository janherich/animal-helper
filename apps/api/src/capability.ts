export type CapabilityParseResult =
  | Readonly<{ ok: true; value: Buffer }>
  | Readonly<{ ok: false; error: "missing" | "invalid" }>;

const CAPABILITY_SCHEME = /^capability$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+=*$/;

export const parseCapabilityHeader = (
  authorization: string | undefined,
): CapabilityParseResult => {
  if (authorization === undefined || authorization.trim() === "") {
    return { ok: false, error: "missing" };
  }

  const parts = authorization.trim().split(/\s+/);
  const [scheme, token, extra] = parts;

  if (scheme === undefined || token === undefined || extra !== undefined) {
    return { ok: false, error: "invalid" };
  }

  if (!CAPABILITY_SCHEME.test(scheme) || !TOKEN_PATTERN.test(token)) {
    return { ok: false, error: "invalid" };
  }

  const bytes = Buffer.from(token, "base64url");
  if (bytes.length < 32) {
    return { ok: false, error: "invalid" };
  }

  return { ok: true, value: bytes };
};

export const requestHasForbiddenQuery = (search: string): boolean =>
  search.length > 0 && search !== "?";
