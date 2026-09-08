import { nextCustomerPath } from "@animal-helper/guidance";
import type { Router } from "vue-router";

import { currentKindKey, currentSituationType } from "./runtime.js";

export const continueWalkTo = async (
  router: Router,
  currentPath: string,
): Promise<boolean> => {
  const next = nextCustomerPath(
    currentPath,
    currentSituationType(),
    currentKindKey(),
  );
  if (next === undefined) {
    return false;
  }
  await router.push(next);
  return true;
};
