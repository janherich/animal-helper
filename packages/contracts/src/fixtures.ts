import type { TransportCaseCommand } from "./case-commands.js";
import type {
  ContactPayloadV1,
  FormSnapshotV1,
  LocationPayloadV1,
  MediaRefPayloadV1,
} from "./private-payloads.js";

const occurredAt = "2026-08-22T12:00:00.000Z";
const streamId = "018f1a50-7c3b-7000-8000-000000000001";
const correlationId = "018f1a50-7c3b-7000-8000-0000000000c0";

export const syntheticCreateDraftCommand = {
  type: "create_draft",
  schemaVersion: 1,
  commandId: "018f1a50-7c3b-7000-8000-000000000101",
  streamId,
  expectedVersion: 0,
  occurredAt,
  correlationId,
} as const satisfies TransportCaseCommand;

export const syntheticAttachPrivateDataCommand = {
  type: "attach_private_data",
  schemaVersion: 1,
  commandId: "018f1a50-7c3b-7000-8000-000000000102",
  streamId,
  expectedVersion: 1,
  occurredAt,
  correlationId,
  privateRecordId: "018f1a50-7c3b-7000-8000-000000000201",
  kind: "text",
  privatePayload: {
    syntheticNotes: "synthetic-case-notes",
  },
} as const satisfies TransportCaseCommand;

export const syntheticSubmitDraftCommand = {
  type: "submit_draft",
  schemaVersion: 1,
  commandId: "018f1a50-7c3b-7000-8000-000000000103",
  streamId,
  expectedVersion: 2,
  occurredAt,
  correlationId,
} as const satisfies TransportCaseCommand;

export const syntheticCaseCommands = [
  syntheticCreateDraftCommand,
  syntheticAttachPrivateDataCommand,
  syntheticSubmitDraftCommand,
] as const;

export const syntheticFormSnapshot = {
  schemaVersion: 1,
  situationType: "injured",
  species: {
    source: "manual",
    groupKey: "domestic",
    categoryKey: "companion",
    kindKey: "domestic_cat",
  },
  condition: {
    symptoms: ["bleeding"],
    conscious: "yes",
    isJuvenile: "no",
  },
  mediaRecordIds: ["018f1a50-7c3b-7000-8000-000000000301"],
} as const satisfies FormSnapshotV1;

export const syntheticLocationPayload = {
  schemaVersion: 1,
  address: "Synthetic testerska 1",
  coordinates: {
    latitude: 48.15,
    longitude: 17.11,
  },
} as const satisfies LocationPayloadV1;

export const syntheticContactPayload = {
  schemaVersion: 1,
  name: "Synthetic Reporter",
  phone: "+421900000000",
  email: "synthetic-reporter@example.invalid",
  shareWithAuthorities: false,
  newsletter: false,
} as const satisfies ContactPayloadV1;

export const syntheticMediaRefPayload = {
  schemaVersion: 1,
  contentType: "image/jpeg",
  byteSize: 12_345,
  checksumSha256:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
} as const satisfies MediaRefPayloadV1;

export const syntheticAttachFormSnapshotCommand = {
  type: "attach_private_data",
  schemaVersion: 1,
  commandId: "018f1a50-7c3b-7000-8000-000000000104",
  streamId,
  expectedVersion: 1,
  occurredAt,
  correlationId,
  privateRecordId: "018f1a50-7c3b-7000-8000-000000000202",
  kind: "form_snapshot",
  privatePayload: syntheticFormSnapshot,
} as const satisfies TransportCaseCommand;

export const syntheticAttachLocationCommand = {
  type: "attach_private_data",
  schemaVersion: 1,
  commandId: "018f1a50-7c3b-7000-8000-000000000105",
  streamId,
  expectedVersion: 1,
  occurredAt,
  correlationId,
  privateRecordId: "018f1a50-7c3b-7000-8000-000000000203",
  kind: "location",
  privatePayload: syntheticLocationPayload,
} as const satisfies TransportCaseCommand;

export const syntheticAttachContactCommand = {
  type: "attach_private_data",
  schemaVersion: 1,
  commandId: "018f1a50-7c3b-7000-8000-000000000106",
  streamId,
  expectedVersion: 1,
  occurredAt,
  correlationId,
  privateRecordId: "018f1a50-7c3b-7000-8000-000000000204",
  kind: "contact",
  privatePayload: syntheticContactPayload,
} as const satisfies TransportCaseCommand;
