import {
  capabilityAllowsStatusRead,
  hashCapability,
} from "@animal-helper/event-store";

import { apiError, apiSuccess } from "./errors.js";
import type { ApiGateway } from "./gateway.js";

export const handleStatus = async (
  capability: Buffer,
  gateway: ApiGateway,
  pepper: Buffer,
  now: Date,
) => {
  const stored = await gateway.lookupCapabilityByHash(
    hashCapability(capability, pepper),
  );

  if (stored === undefined || !capabilityAllowsStatusRead(stored, now)) {
    return apiError("NOT_FOUND");
  }

  const status = await gateway.getPublicStatus(stored.streamId);
  if (status === undefined) {
    return apiError("NOT_FOUND");
  }

  return apiSuccess(status);
};
