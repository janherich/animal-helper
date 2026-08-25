import {
  applyCommand,
  getPublicStatus,
  lookupCapabilityByHash,
  type ApplyCommandInput,
  type ApplyResult,
  type StoredCapability,
  type StoredPublicStatus,
} from "@animal-helper/event-store";
import type { Sql } from "postgres";

export type ApiGateway = Readonly<{
  applyCommand: (input: ApplyCommandInput) => Promise<ApplyResult>;
  lookupCapabilityByHash: (
    capabilityHash: Buffer,
  ) => Promise<StoredCapability | undefined>;
  getPublicStatus: (
    streamId: string,
  ) => Promise<StoredPublicStatus | undefined>;
}>;

export const createPostgresGateway = (sql: Sql): ApiGateway => ({
  applyCommand: (input) => applyCommand(sql, input),
  lookupCapabilityByHash: (capabilityHash) =>
    lookupCapabilityByHash(sql, capabilityHash),
  getPublicStatus: (streamId) => getPublicStatus(sql, streamId),
});
