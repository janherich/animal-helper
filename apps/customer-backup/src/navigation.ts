import { walkViewAfterPath } from "@animal-helper/guidance";
import type { Router } from "vue-router";

import { currentWalkFacts, loadPublicGuidance } from "./runtime.js";

export const continueWalkTo = async (
  router: Router,
  currentPath: string,
): Promise<boolean> => {
  const next = walkViewAfterPath(
    currentPath,
    currentWalkFacts(),
    await loadPublicGuidance(),
  );
  if (next === undefined) {
    return false;
  }
  await router.push(next.path);
  return true;
};
