import { bootstrapTokenFromHash } from "./bootstrap-hash.js";

let pendingToken: string | undefined;

export const captureBootstrapToken = (): string | undefined => {
  pendingToken = bootstrapTokenFromHash(location.hash);
  if (location.hash.length > 0) {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
  }
  return pendingToken;
};

export const pendingBootstrapToken = (): string | undefined => pendingToken;

export const clearPendingBootstrapToken = (): void => {
  pendingToken = undefined;
};
