import type { CaseSession, CaseSnapshot } from "@animal-helper/client";
import {
  bundledPublicGuidance,
  parsePublicGuidance,
  type PublicGuidance,
  type WalkFacts,
} from "@animal-helper/guidance";
import { shallowRef } from "vue";

import { apiBaseUrl } from "./config.js";
import { createCustomerSession, type SituationType } from "./walk.js";

const initialWalkFacts = (): WalkFacts => ({
  situationType: "injured",
  hasDraft: false,
  hasLocation: false,
  photoDone: false,
  hasFormSnapshot: false,
  hasContact: false,
  submitted: false,
});

let session: CaseSession | undefined;
let walkState: WalkFacts = initialWalkFacts();
let guidancePromise: Promise<PublicGuidance> | undefined;

export const snapshotState = shallowRef<CaseSnapshot | undefined>();

export const customerSession = (): CaseSession => {
  session ??= createCustomerSession(apiBaseUrl());
  return session;
};

export const currentWalkFacts = (): WalkFacts => walkState;

export const currentSituationType = (): SituationType =>
  walkState.situationType;

export const currentKindKey = (): string | undefined => walkState.kindKey;

export const patchWalkFacts = (patch: Partial<WalkFacts>): WalkFacts => {
  walkState = { ...walkState, ...patch };
  return walkState;
};

const withoutKindKey = (facts: WalkFacts): WalkFacts => ({
  situationType: facts.situationType,
  hasDraft: facts.hasDraft,
  hasLocation: facts.hasLocation,
  photoDone: facts.photoDone,
  hasFormSnapshot: facts.hasFormSnapshot,
  hasContact: facts.hasContact,
  submitted: facts.submitted,
  ...(facts.publicState === undefined
    ? {}
    : { publicState: facts.publicState }),
  ...(facts.fieldErrors === undefined
    ? {}
    : { fieldErrors: facts.fieldErrors }),
});

export const setSituationType = (situationType: SituationType): void => {
  walkState = { ...withoutKindKey(walkState), situationType };
};

export const setKindKey = (kindKey: string | undefined): void => {
  if (kindKey === undefined) {
    walkState = withoutKindKey(walkState);
    return;
  }
  walkState = { ...walkState, kindKey };
};

export const currentSnapshot = (): CaseSnapshot | undefined =>
  snapshotState.value;

export const rememberSnapshot = (snapshot: CaseSnapshot): CaseSnapshot => {
  snapshotState.value = snapshot;
  return snapshot;
};

const fetchPublicGuidance = async (): Promise<PublicGuidance> => {
  try {
    const response = await fetch(`${apiBaseUrl()}/guidance`, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      return bundledPublicGuidance();
    }
    return parsePublicGuidance(await response.json());
  } catch {
    return bundledPublicGuidance();
  }
};

export const loadPublicGuidance = (): Promise<PublicGuidance> => {
  guidancePromise ??= fetchPublicGuidance();
  return guidancePromise;
};

export const resetCustomerRuntime = async (): Promise<void> => {
  if (session !== undefined) {
    await session.removeLocal();
  }

  session = undefined;
  snapshotState.value = undefined;
  walkState = initialWalkFacts();
  guidancePromise = undefined;
};
