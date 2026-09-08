import { describe, expect, it } from "vitest";

import { t } from "@animal-helper/i18n";

import {
  draftProgressRatio,
  draftResumeFromPath,
  draftStepIndex,
  draftSummary,
  formatDraftStep,
  isWalkableSituation,
  situationChoices,
} from "../src/situation.js";
import { CUSTOMER_PATHS } from "../src/walk.js";

describe("W01 situation choices", () => {
  it("keeps Figma entry points without expanding the snapshot schema", () => {
    expect(situationChoices.map((choice) => choice.key)).toEqual([
      "injured",
      "stray",
      "dead",
      "cruelty",
      "other",
    ]);
    expect(situationChoices.find((choice) => choice.key === "other")).toEqual({
      key: "other",
      style: "outlined",
    });
    expect(isWalkableSituation("injured")).toBe(true);
    expect(isWalkableSituation("stray")).toBe(true);
    expect(isWalkableSituation("dead")).toBe(false);
    expect(isWalkableSituation("cruelty")).toBe(false);
    expect(isWalkableSituation("other")).toBe(false);
  });

  it("resumes a draft from location until a kind is chosen", () => {
    expect(draftStepIndex(undefined)).toBe(1);
    expect(draftProgressRatio(undefined)).toBe(0.25);
    expect(formatDraftStep(undefined)).toBe("Krok 1 zo 4");
    expect(draftSummary("injured", undefined)).toBe("Zranené zviera");
    expect(draftResumeFromPath(undefined)).toBe(CUSTOMER_PATHS.situation);
  });

  it("treats a chosen kind as step 3 of the skeleton walk", () => {
    expect(draftStepIndex("domestic_dog")).toBe(3);
    expect(draftProgressRatio("domestic_dog")).toBe(0.75);
    expect(formatDraftStep("domestic_dog")).toBe("Krok 3 zo 4");
    expect(draftSummary("injured", "domestic_dog")).toBe(
      "Zranené zviera • Pes",
    );
    expect(draftResumeFromPath("domestic_dog")).toBe(CUSTOMER_PATHS.details);
    expect(t("customer.situation.title")).toBe("Čo sa stalo?");
    expect(t("customer.chrome.brand")).toBe("Zverolinka");
  });
});
