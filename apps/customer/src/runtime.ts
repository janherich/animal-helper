import type { CaseSession, CaseSnapshot } from "@animal-helper/client";
import { shallowRef } from "vue";

import { apiBaseUrl } from "./config.js";
import { createCustomerSession, type SituationType } from "./walk.js";

type WalkState = {
  situationType: SituationType;
};

let session: CaseSession | undefined;
let walkState: WalkState = { situationType: "injured" };

export const snapshotState = shallowRef<CaseSnapshot | undefined>();

export const customerSession = (): CaseSession => {
  session ??= createCustomerSession(apiBaseUrl());
  return session;
};

export const currentSituationType = (): SituationType =>
  walkState.situationType;

export const setSituationType = (situationType: SituationType): void => {
  walkState = { situationType };
};

export const currentSnapshot = (): CaseSnapshot | undefined =>
  snapshotState.value;

export const rememberSnapshot = (snapshot: CaseSnapshot): CaseSnapshot => {
  snapshotState.value = snapshot;
  return snapshot;
};

export const resetCustomerRuntime = async (): Promise<void> => {
  if (session !== undefined) {
    await session.removeLocal();
  }

  session = undefined;
  snapshotState.value = undefined;
  walkState = { situationType: "injured" };
};
