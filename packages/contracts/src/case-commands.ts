import {
  type CaseCommand,
  type PrivateRecordKind,
} from "@animal-helper/domain";
import { z } from "zod";

import {
  contactPayloadV1Schema,
  formSnapshotV1Schema,
  locationPayloadV1Schema,
  mediaRefPayloadV1Schema,
  textPayloadSchema,
} from "./private-payloads.js";

const commandEnvelope = {
  schemaVersion: z.literal(1),
  commandId: z.uuid(),
  streamId: z.uuid(),
  expectedVersion: z.int().nonnegative(),
  occurredAt: z.iso.datetime(),
  correlationId: z.uuid(),
  causationId: z.uuid().optional(),
} as const;

const attachEnvelope = {
  type: z.literal("attach_private_data"),
  ...commandEnvelope,
  privateRecordId: z.uuid(),
} as const;

export const attachFormSnapshotCommandSchema = z.strictObject({
  ...attachEnvelope,
  kind: z.literal("form_snapshot"),
  privatePayload: formSnapshotV1Schema,
});

export const attachLocationCommandSchema = z.strictObject({
  ...attachEnvelope,
  kind: z.literal("location"),
  privatePayload: locationPayloadV1Schema,
});

export const attachContactCommandSchema = z.strictObject({
  ...attachEnvelope,
  kind: z.literal("contact"),
  privatePayload: contactPayloadV1Schema,
});

export const attachMediaRefCommandSchema = z.strictObject({
  ...attachEnvelope,
  kind: z.literal("media_ref"),
  privatePayload: mediaRefPayloadV1Schema,
});

export const attachTextCommandSchema = z.strictObject({
  ...attachEnvelope,
  kind: z.literal("text"),
  privatePayload: textPayloadSchema,
});

export const attachPrivateDataCommandSchema = z.discriminatedUnion("kind", [
  attachFormSnapshotCommandSchema,
  attachLocationCommandSchema,
  attachContactCommandSchema,
  attachMediaRefCommandSchema,
  attachTextCommandSchema,
]);

export const createDraftCommandSchema = z.strictObject({
  type: z.literal("create_draft"),
  ...commandEnvelope,
  expectedVersion: z.literal(0),
});

export const submitDraftCommandSchema = z.strictObject({
  type: z.literal("submit_draft"),
  ...commandEnvelope,
});

export const startReviewCommandSchema = z.strictObject({
  type: z.literal("start_review"),
  ...commandEnvelope,
});

export const completeCaseCommandSchema = z.strictObject({
  type: z.literal("complete_case"),
  ...commandEnvelope,
});

export const purgePrivateDataCommandSchema = z.strictObject({
  type: z.literal("purge_private_data"),
  ...commandEnvelope,
});

export const expireDraftCommandSchema = z.strictObject({
  type: z.literal("expire_draft"),
  ...commandEnvelope,
});

export const caseCommandSchema = z.union([
  createDraftCommandSchema,
  attachPrivateDataCommandSchema,
  submitDraftCommandSchema,
  startReviewCommandSchema,
  completeCaseCommandSchema,
  purgePrivateDataCommandSchema,
  expireDraftCommandSchema,
]);

export type TransportCaseCommand = z.infer<typeof caseCommandSchema>;
export type TransportAttachPrivateDataCommand = z.infer<
  typeof attachPrivateDataCommandSchema
>;

export const parseCaseCommand = (
  value: unknown,
): z.ZodSafeParseResult<TransportCaseCommand> =>
  caseCommandSchema.safeParse(value);

export const toDomainCaseCommand = (
  command: TransportCaseCommand,
): CaseCommand => {
  switch (command.type) {
    case "attach_private_data":
      return {
        type: "attach_private_data",
        privateRecordId: command.privateRecordId,
        kind: command.kind satisfies PrivateRecordKind,
      };
    case "create_draft":
      return { type: "create_draft" };
    case "submit_draft":
      return { type: "submit_draft" };
    case "start_review":
      return { type: "start_review" };
    case "complete_case":
      return { type: "complete_case" };
    case "purge_private_data":
      return { type: "purge_private_data" };
    case "expire_draft":
      return { type: "expire_draft" };
  }
};

export const publicCaseStatusSchema = z.strictObject({
  streamId: z.uuid(),
  publicState: z.enum(["draft", "received", "closed"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type PublicCaseStatus = z.infer<typeof publicCaseStatusSchema>;
