import type { CaseSession, CaseSnapshot } from "@animal-helper/client";
import {
  bundledPublicGuidance,
  parsePublicGuidance,
  type PublicGuidance,
} from "@animal-helper/guidance";
import { shallowRef } from "vue";

import { apiBaseUrl } from "./config.js";
import { createCustomerSession, type SituationType } from "./walk.js";

type WalkState = {
  situationType: SituationType;
  kindKey?: string;
};

let session: CaseSession | undefined;
let walkState: WalkState = { situationType: "injured" };
let guidancePromise: Promise<PublicGuidance> | undefined;

export const snapshotState = shallowRef<CaseSnapshot | undefined>();

export const customerSession = (): CaseSession => {
  session ??= createCustomerSession(apiBaseUrl());
  return session;
};

export const currentSituationType = (): SituationType =>
  walkState.situationType;

export const currentKindKey = (): string | undefined => walkState.kindKey;

export const setSituationType = (situationType: SituationType): void => {
  walkState = { situationType };
};

export const setKindKey = (kindKey: string | undefined): void => {
  if (kindKey === undefined) {
    walkState = { situationType: walkState.situationType };
    return;
  }
  walkState = { situationType: walkState.situationType, kindKey };
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
  walkState = { situationType: "injured" };
};
