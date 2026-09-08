import { describe, expect, it } from "vitest";

import { t } from "@animal-helper/i18n";

import { LOCATION_WALK_STEP } from "../src/location.js";
import { defaultLocationPayload } from "../src/walk.js";

describe("W03 location mock", () => {
  it("keeps walk chrome and a synthetic payload until the picker exists", () => {
    expect(LOCATION_WALK_STEP).toBe(1);
    expect(t("customer.location.title")).toBe("Kde sa zviera nachádza?");
    expect(t("customer.location.confirm")).toBe("Potvrdiť polohu");
    expect(defaultLocationPayload()).toEqual({
      schemaVersion: 1,
      address: "Synthetic testerska 1",
    });
  });
});
