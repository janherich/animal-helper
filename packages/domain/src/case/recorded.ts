import { err, ok, type Result } from "../result.js";
import type { RecordedEvent } from "../event-stream.js";
import {
  CASE_EVENT_TYPE,
  type CaseDomainEvent,
  type CaseEventType,
  type PrivateRecordKind,
} from "./types.js";

export type CaseEventPayload =
  | Readonly<Record<string, never>>
  | Readonly<{
      privateRecordId: string;
      kind: PrivateRecordKind;
    }>;

export type RecordedCaseEvent = RecordedEvent<CaseEventType, CaseEventPayload>;

const PRIVATE_RECORD_KINDS = new Set<PrivateRecordKind>([
  "contact",
  "text",
  "location",
  "media_ref",
  "form_snapshot",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPrivateRecordKind = (value: unknown): value is PrivateRecordKind =>
  typeof value === "string" &&
  PRIVATE_RECORD_KINDS.has(value as PrivateRecordKind);

export type CaseEventDecodeError = Readonly<{
  code: "UNSUPPORTED_SCHEMA_VERSION" | "UNKNOWN_EVENT_TYPE" | "INVALID_PAYLOAD";
  eventId: string;
  eventType: string;
}>;

export const encodeCaseEventPayload = (
  event: CaseDomainEvent,
): CaseEventPayload => {
  if (event.type === "private_data_attached") {
    return {
      privateRecordId: event.privateRecordId,
      kind: event.kind,
    };
  }

  return {};
};

export const recordedTypeFor = (event: CaseDomainEvent): CaseEventType => {
  switch (event.type) {
    case "draft_created":
      return CASE_EVENT_TYPE.draftCreated;
    case "private_data_attached":
      return CASE_EVENT_TYPE.privateDataAttached;
    case "draft_submitted":
      return CASE_EVENT_TYPE.draftSubmitted;
    case "review_started":
      return CASE_EVENT_TYPE.reviewStarted;
    case "case_completed":
      return CASE_EVENT_TYPE.caseCompleted;
    case "private_data_purged":
      return CASE_EVENT_TYPE.privateDataPurged;
    case "draft_expired":
      return CASE_EVENT_TYPE.draftExpired;
  }
};

export const decodeRecordedCaseEvent = (
  event: RecordedEvent,
): Result<CaseDomainEvent, CaseEventDecodeError> => {
  if (event.schemaVersion !== 1) {
    return err({
      code: "UNSUPPORTED_SCHEMA_VERSION",
      eventId: event.id,
      eventType: event.type,
    });
  }

  switch (event.type) {
    case CASE_EVENT_TYPE.draftCreated:
      return ok({ type: "draft_created" });
    case CASE_EVENT_TYPE.draftSubmitted:
      return ok({ type: "draft_submitted" });
    case CASE_EVENT_TYPE.reviewStarted:
      return ok({ type: "review_started" });
    case CASE_EVENT_TYPE.caseCompleted:
      return ok({ type: "case_completed" });
    case CASE_EVENT_TYPE.privateDataPurged:
      return ok({ type: "private_data_purged" });
    case CASE_EVENT_TYPE.draftExpired:
      return ok({ type: "draft_expired" });
    case CASE_EVENT_TYPE.privateDataAttached: {
      if (!isRecord(event.payload)) {
        return err({
          code: "INVALID_PAYLOAD",
          eventId: event.id,
          eventType: event.type,
        });
      }

      const { privateRecordId, kind } = event.payload;

      if (typeof privateRecordId !== "string" || !isPrivateRecordKind(kind)) {
        return err({
          code: "INVALID_PAYLOAD",
          eventId: event.id,
          eventType: event.type,
        });
      }

      return ok({
        type: "private_data_attached",
        privateRecordId,
        kind,
      });
    }
    default:
      return err({
        code: "UNKNOWN_EVENT_TYPE",
        eventId: event.id,
        eventType: event.type,
      });
  }
};

export const decodeRecordedCaseEvents = (
  events: readonly RecordedEvent[],
): Result<readonly CaseDomainEvent[], CaseEventDecodeError> => {
  const decoded: CaseDomainEvent[] = [];

  for (const event of events) {
    const result = decodeRecordedCaseEvent(event);

    if (!result.ok) {
      return result;
    }

    decoded.push(result.value);
  }

  return ok(decoded);
};
