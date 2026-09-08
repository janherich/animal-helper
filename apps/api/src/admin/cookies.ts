import type { AdminCookie } from "./config.js";

export const readCookie = (
  header: string | undefined,
  name: string,
): string | undefined => {
  if (header === undefined || header.length === 0) {
    return undefined;
  }

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key === name) {
      const value = part.slice(separator + 1).trim();
      return value.length === 0 ? undefined : value;
    }
  }

  return undefined;
};

export const sessionCookie = (
  cookie: AdminCookie,
  token: string,
  maxAgeSeconds: number,
): string => {
  const attributes = [
    `${cookie.name}=${token}`,
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    `SameSite=${cookie.sameSite}`,
  ];
  if (cookie.secure) {
    attributes.push("Secure");
  }
  return attributes.join("; ");
};

export const clearedSessionCookie = (cookie: AdminCookie): string => {
  const attributes = [
    `${cookie.name}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    `SameSite=${cookie.sameSite}`,
  ];
  if (cookie.secure) {
    attributes.push("Secure");
  }
  return attributes.join("; ");
};
