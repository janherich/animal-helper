import { hashesEqual } from "./hash.js";
import type { Queryable } from "./sql.js";

export type StoredCapability = Readonly<{
  streamId: string;
  mutationAllowed: boolean;
  expiresAt: Date | null;
}>;

export const capabilityAllowsMutation = (
  capability: StoredCapability,
  now: Date,
): boolean =>
  capability.mutationAllowed &&
  (capability.expiresAt === null ||
    capability.expiresAt.getTime() > now.getTime());

export const capabilityAllowsStatusRead = (
  capability: StoredCapability,
  now: Date,
): boolean => {
  if (capability.mutationAllowed) {
    return (
      capability.expiresAt === null ||
      capability.expiresAt.getTime() > now.getTime()
    );
  }

  return capability.expiresAt === null;
};

export const lookupCapabilityByHash = async (
  sql: Queryable,
  capabilityHash: Buffer,
): Promise<StoredCapability | undefined> => {
  const [row] = await sql<
    {
      stream_id: string;
      capability_hash: Buffer;
      mutation_allowed: boolean;
      expires_at: Date | null;
    }[]
  >`
    select stream_id, capability_hash, mutation_allowed, expires_at
    from ah.capabilities
    where capability_hash = ${capabilityHash}
  `;

  if (row === undefined) {
    return undefined;
  }

  if (!hashesEqual(Buffer.from(row.capability_hash), capabilityHash)) {
    return undefined;
  }

  return {
    streamId: row.stream_id,
    mutationAllowed: row.mutation_allowed,
    expiresAt: row.expires_at,
  };
};
