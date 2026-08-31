import {
  createCaseSession,
  createFetchTransport,
  createMemoryCaseStore,
  type CaseSession,
  type CaseSnapshot,
  type ClientError,
} from "@animal-helper/client";
import type {
  ContactPayloadV1,
  FormSnapshotV1,
  LocationPayloadV1,
} from "@animal-helper/contracts";
import { ok, type Result } from "@animal-helper/domain";
import { customerWalkPath } from "@animal-helper/guidance";

export const CUSTOMER_PATHS = {
  situation: customerWalkPath("situation"),
  location: customerWalkPath("location"),
  details: customerWalkPath("details"),
  contact: customerWalkPath("contact"),
  thanks: customerWalkPath("thanks"),
} as const;

export type SituationType = FormSnapshotV1["situationType"];

export const defaultLocationPayload = (): LocationPayloadV1 => ({
  schemaVersion: 1,
  address: "Synthetic testerska 1",
});

export const detailsSnapshot = (
  situationType: SituationType,
): FormSnapshotV1 => ({
  schemaVersion: 1,
  situationType,
  species: { source: "skipped" },
  condition: { symptoms: [] },
  mediaRecordIds: [],
});

export const defaultContactPayload = (): ContactPayloadV1 => ({
  schemaVersion: 1,
  shareWithAuthorities: false,
  newsletter: false,
});

export const createCustomerSession = (baseUrl: string): CaseSession =>
  createCaseSession({
    store: createMemoryCaseStore(),
    transport: createFetchTransport({ baseUrl }),
  });

export const confirmSituation = async (
  session: CaseSession,
): Promise<Result<CaseSnapshot, ClientError>> => {
  const existing = await session.snapshot();
  return existing === undefined ? session.openDraft() : ok(existing);
};

export const confirmLocation = (
  session: CaseSession,
  payload: LocationPayloadV1,
): Promise<Result<CaseSnapshot, ClientError>> =>
  session.attachLocation(payload);

export const confirmDetails = (
  session: CaseSession,
  situationType: SituationType,
): Promise<Result<CaseSnapshot, ClientError>> =>
  session.attachFormSnapshot(detailsSnapshot(situationType));

export const submitReport = async (
  session: CaseSession,
  payload: ContactPayloadV1,
): Promise<Result<CaseSnapshot, ClientError>> => {
  const attached = await session.attachContact(payload);
  if (!attached.ok) {
    return attached;
  }

  return session.submit();
};
