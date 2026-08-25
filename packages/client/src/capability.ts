import { err, ok, type Result } from "@animal-helper/domain";

import { base64UrlToBytes, bytesToBase64Url } from "./base64url.js";
import { invalidCapability, type ClientError } from "./errors.js";

export const CAPABILITY_BYTES = 32;

const fillRandomBytes = (): Uint8Array => {
  const bytes = new Uint8Array(new ArrayBuffer(CAPABILITY_BYTES));
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
};

export const createCapability = (
  randomBytes: () => Uint8Array = fillRandomBytes,
): Uint8Array => {
  const bytes = randomBytes();
  if (bytes.byteLength < CAPABILITY_BYTES) {
    throw new Error("capability must contain at least 256 bits");
  }

  return bytes.byteLength === CAPABILITY_BYTES
    ? bytes
    : bytes.subarray(0, CAPABILITY_BYTES);
};

export const encodeCapability = (capability: Uint8Array): string => {
  if (capability.byteLength < CAPABILITY_BYTES) {
    throw new Error("capability must contain at least 256 bits");
  }

  return bytesToBase64Url(capability);
};

export const decodeCapability = (
  token: string,
): Result<Uint8Array, ClientError> => {
  const bytes = base64UrlToBytes(token.trim());
  if (bytes === undefined || bytes.byteLength < CAPABILITY_BYTES) {
    return err(invalidCapability);
  }

  return ok(bytes);
};

export const capabilityAuthorization = (capability: Uint8Array): string =>
  `Capability ${encodeCapability(capability)}`;

export const parseCapabilityFragment = (
  fragment: string,
): Result<Uint8Array, ClientError> => {
  const raw = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  if (raw === "") {
    return err(invalidCapability);
  }

  const token = raw.includes("=") ? new URLSearchParams(raw).get("c") : raw;

  if (token === null || token === "") {
    return err(invalidCapability);
  }

  return decodeCapability(token);
};

export const capabilityFragment = (capability: Uint8Array): string =>
  `#c=${encodeCapability(capability)}`;
