import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { canonicalJson } from "./canonical-json.js";

export const parseCapabilityPepper = (value: string): Buffer => {
  const pepper = Buffer.from(value, "hex");

  if (pepper.length < 32) {
    throw new Error("CAPABILITY_PEPPER must be at least 32 bytes of hex");
  }

  return pepper;
};

export const hashCapability = (capability: Buffer, pepper: Buffer): Buffer => {
  if (capability.length < 32) {
    throw new Error("capability must contain at least 256 bits");
  }

  return createHmac("sha256", pepper).update(capability).digest();
};

export const hashesEqual = (left: Buffer, right: Buffer): boolean =>
  left.length === right.length && timingSafeEqual(left, right);

export const sha256Buffer = (value: string | Buffer): Buffer =>
  createHash("sha256").update(value).digest();

export const hashCommandContent = (command: unknown): Buffer =>
  sha256Buffer(canonicalJson(command));
