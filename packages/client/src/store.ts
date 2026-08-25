import {
  parseCaseCommand,
  publicCaseStatusSchema,
  type PublicCaseStatus,
  type TransportCaseCommand,
} from "@animal-helper/contracts";
import { err, ok, type Result } from "@animal-helper/domain";

import { decodeCapability } from "./capability.js";
import {
  invalidCapability,
  invalidCommand,
  type ClientError,
} from "./errors.js";

export type Durability =
  | "device_only"
  | "queued"
  | "acknowledged"
  | "received"
  | "closed"
  | "needs_attention";

export type StoredCase = Readonly<{
  capabilityToken: string;
  streamId: string;
  correlationId: string;
  expectedVersion: number;
  mutationAllowed: boolean;
  acknowledgedCommandIds: readonly string[];
  queue: readonly TransportCaseCommand[];
  lastPublicStatus?: PublicCaseStatus;
  lastError?: ClientError;
}>;

export type CaseStore = Readonly<{
  load: () => Promise<StoredCase | undefined>;
  save: (record: StoredCase) => Promise<void>;
  clear: () => Promise<void>;
}>;

export const createMemoryCaseStore = (initial?: StoredCase): CaseStore => {
  let record = initial;

  return {
    load: () => Promise.resolve(record),
    save: (next) => {
      record = next;
      return Promise.resolve();
    },
    clear: () => {
      record = undefined;
      return Promise.resolve();
    },
  };
};

export const hydrateStoredCase = (
  record: StoredCase,
): Result<StoredCase, ClientError> => {
  if (!decodeCapability(record.capabilityToken).ok) {
    return err(invalidCapability);
  }

  if (
    record.lastPublicStatus !== undefined &&
    !publicCaseStatusSchema.safeParse(record.lastPublicStatus).success
  ) {
    return err(invalidCommand);
  }

  for (const command of record.queue) {
    if (!parseCaseCommand(command).success) {
      return err(invalidCommand);
    }
  }

  return ok(record);
};

export const durabilityOf = (record: StoredCase): Durability => {
  if (record.lastError !== undefined && !record.lastError.retryable) {
    return "needs_attention";
  }

  if (record.queue.length > 0) {
    return record.acknowledgedCommandIds.length === 0
      ? "device_only"
      : "queued";
  }

  switch (record.lastPublicStatus?.publicState) {
    case "closed":
      return "closed";
    case "received":
      return "received";
    case "draft":
      return "acknowledged";
    case undefined:
      return "device_only";
  }
};
