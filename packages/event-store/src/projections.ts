import {
  hasAvailablePrivateData,
  toPublicCaseState,
  type CaseState,
  type PublicCaseState,
} from "@animal-helper/domain";
import type { Queryable } from "./sql.js";

export type StoredPublicStatus = Readonly<{
  streamId: string;
  publicState: PublicCaseState;
  createdAt: string;
  updatedAt: string;
}>;

const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : value;

export const projectCase = async (
  sql: Queryable,
  input: Readonly<{
    streamId: string;
    state: CaseState;
    createdAt: Date;
    updatedAt: Date;
  }>,
): Promise<void> => {
  if (input.state.status === "uninitialized") {
    return;
  }

  const publicState = toPublicCaseState(input.state.status);

  await sql`
    insert into ah.case_status_projection (
      stream_id,
      public_state,
      created_at,
      updated_at
    )
    values (
      ${input.streamId}::uuid,
      ${publicState},
      ${input.createdAt},
      ${input.updatedAt}
    )
    on conflict (stream_id) do update
    set
      public_state = excluded.public_state,
      updated_at = excluded.updated_at
  `;

  await sql`
    insert into ah.case_queue_projection (
      stream_id,
      workflow_state,
      has_private_data,
      private_data_purged,
      created_at,
      updated_at
    )
    values (
      ${input.streamId}::uuid,
      ${input.state.status},
      ${hasAvailablePrivateData(input.state)},
      ${input.state.privateDataPurged},
      ${input.createdAt},
      ${input.updatedAt}
    )
    on conflict (stream_id) do update
    set
      workflow_state = excluded.workflow_state,
      has_private_data = excluded.has_private_data,
      private_data_purged = excluded.private_data_purged,
      updated_at = excluded.updated_at
  `;
};

export const getPublicStatus = async (
  sql: Queryable,
  streamId: string,
): Promise<StoredPublicStatus | undefined> => {
  const [row] = await sql<
    {
      stream_id: string;
      public_state: PublicCaseState;
      created_at: Date;
      updated_at: Date;
    }[]
  >`
    select stream_id, public_state, created_at, updated_at
    from ah.case_status_projection
    where stream_id = ${streamId}::uuid
  `;

  if (row === undefined) {
    return undefined;
  }

  return {
    streamId: row.stream_id,
    publicState: row.public_state,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
};
