import { describe, expect, it } from "vitest";

import { t } from "@animal-helper/i18n";

import { PHOTO_PATH, PHOTO_WALK_STEP } from "../src/photo.js";

describe("W04 photo mock", () => {
  it("is an optional skip step before details", () => {
    expect(PHOTO_PATH).toBe("/w04");
    expect(PHOTO_WALK_STEP).toBe(2);
    expect(t("customer.photo.title")).toBe("Pridajte fotografiu alebo video");
    expect(t("customer.photo.skip")).toBe("Nemám fotografiu");
  });
});
