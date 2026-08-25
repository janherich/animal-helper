import {
  parseCaseCommand,
  type ContactPayloadV1,
  type FormSnapshotV1,
  type LocationPayloadV1,
  type MediaRefPayloadV1,
  type TextPayload,
  type TransportCaseCommand,
} from "@animal-helper/contracts";
import { err, ok, type Result } from "@animal-helper/domain";

import { invalidCommand, type ClientError } from "./errors.js";

export type CommandClock = Readonly<{
  now: () => Date;
  createId: () => string;
}>;

export type DraftEnvelope = Readonly<{
  streamId: string;
  correlationId: string;
  expectedVersion: number;
}>;

type CommandEnvelope = Readonly<{
  schemaVersion: 1;
  commandId: string;
  streamId: string;
  expectedVersion: number;
  occurredAt: string;
  correlationId: string;
}>;

const envelope = (
  draft: DraftEnvelope,
  clock: CommandClock,
): CommandEnvelope => ({
  schemaVersion: 1,
  commandId: clock.createId(),
  streamId: draft.streamId,
  expectedVersion: draft.expectedVersion,
  occurredAt: clock.now().toISOString(),
  correlationId: draft.correlationId,
});

const parseBuilt = (
  command: TransportCaseCommand,
): Result<TransportCaseCommand, ClientError> => {
  const parsed = parseCaseCommand(command);
  return parsed.success ? ok(parsed.data) : err(invalidCommand);
};

export const buildCreateDraftCommand = (
  draft: Omit<DraftEnvelope, "expectedVersion">,
  clock: CommandClock,
): Result<TransportCaseCommand, ClientError> =>
  parseBuilt({
    type: "create_draft",
    ...envelope({ ...draft, expectedVersion: 0 }, clock),
    expectedVersion: 0,
  });

export const buildAttachFormSnapshotCommand = (
  draft: DraftEnvelope,
  payload: FormSnapshotV1,
  clock: CommandClock,
): Result<TransportCaseCommand, ClientError> =>
  parseBuilt({
    type: "attach_private_data",
    ...envelope(draft, clock),
    privateRecordId: clock.createId(),
    kind: "form_snapshot",
    privatePayload: payload,
  });

export const buildAttachLocationCommand = (
  draft: DraftEnvelope,
  payload: LocationPayloadV1,
  clock: CommandClock,
): Result<TransportCaseCommand, ClientError> =>
  parseBuilt({
    type: "attach_private_data",
    ...envelope(draft, clock),
    privateRecordId: clock.createId(),
    kind: "location",
    privatePayload: payload,
  });

export const buildAttachContactCommand = (
  draft: DraftEnvelope,
  payload: ContactPayloadV1,
  clock: CommandClock,
): Result<TransportCaseCommand, ClientError> =>
  parseBuilt({
    type: "attach_private_data",
    ...envelope(draft, clock),
    privateRecordId: clock.createId(),
    kind: "contact",
    privatePayload: payload,
  });

export const buildAttachMediaRefCommand = (
  draft: DraftEnvelope,
  payload: MediaRefPayloadV1,
  clock: CommandClock,
): Result<TransportCaseCommand, ClientError> =>
  parseBuilt({
    type: "attach_private_data",
    ...envelope(draft, clock),
    privateRecordId: clock.createId(),
    kind: "media_ref",
    privatePayload: payload,
  });

export const buildAttachTextCommand = (
  draft: DraftEnvelope,
  payload: TextPayload,
  clock: CommandClock,
): Result<TransportCaseCommand, ClientError> =>
  parseBuilt({
    type: "attach_private_data",
    ...envelope(draft, clock),
    privateRecordId: clock.createId(),
    kind: "text",
    privatePayload: payload,
  });

export const buildSubmitDraftCommand = (
  draft: DraftEnvelope,
  clock: CommandClock,
): Result<TransportCaseCommand, ClientError> =>
  parseBuilt({
    type: "submit_draft",
    ...envelope(draft, clock),
  });
