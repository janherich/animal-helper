import type { RecordedEvent } from "@animal-helper/domain";

import type { Queryable } from "./sql.js";

type EventRow = {
  event_id: string;
  stream_id: string;
  stream_version: number;
  event_type: string;
  schema_version: number;
  occurred_at: Date;
  command_id: string;
  correlation_id: string;
  causation_id: string | null;
  payload: unknown;
};

const toRecordedEvent = (row: EventRow): RecordedEvent => {
  const event: RecordedEvent = {
    id: row.event_id,
    streamId: row.stream_id,
    streamVersion: row.stream_version,
    type: row.event_type,
    schemaVersion: row.schema_version,
    occurredAt: row.occurred_at.toISOString(),
    commandId: row.command_id,
    correlationId: row.correlation_id,
    payload: (typeof row.payload === "string"
      ? (JSON.parse(row.payload) as unknown)
      : row.payload) as RecordedEvent["payload"],
  };

  if (row.causation_id === null) {
    return event;
  }

  return {
    ...event,
    causationId: row.causation_id,
  };
};

export const loadRecordedEvents = async (
  sql: Queryable,
  streamId: string,
): Promise<readonly RecordedEvent[]> => {
  const rows = await sql<EventRow[]>`
    select
      event_id,
      stream_id,
      stream_version,
      event_type,
      schema_version,
      occurred_at,
      command_id,
      correlation_id,
      causation_id,
      payload
    from ah.events
    where stream_id = ${streamId}::uuid
    order by stream_version
  `;

  return rows.map(toRecordedEvent);
};
