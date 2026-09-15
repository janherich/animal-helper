import { describe, expect, it } from "vitest";

import { animalKindByKey } from "@animal-helper/guidance";
import { t } from "@animal-helper/i18n";

import {
  DETAILS_WALK_STEP,
  detailsCanContinue,
  detailsCondition,
  groupedInjuredKinds,
  shouldAskJuvenile,
  toggleSymptom,
} from "../src/details.js";
import { detailsSnapshot } from "../src/walk.js";

describe("W09 details", () => {
  it("is step 3 with Figma copy and catalog kind labels", () => {
    expect(DETAILS_WALK_STEP).toBe(3);
    expect(t("customer.details.title")).toBe("Doplňte podrobnosti");
    expect(t("customer.details.continue")).toBe("Zobraziť možnosti pomoci");
    expect(t("customer.details.symptom.bleeding")).toBe("Krváca");
    expect(animalKindByKey("domestic_cat").labelSk).toBe("Mačka");
  });

  it("keeps unknown exclusive and otherText only with other", () => {
    expect(toggleSymptom(["bleeding"], "unknown")).toEqual(["unknown"]);
    expect(toggleSymptom(["unknown"], "hit")).toEqual(["hit"]);
    expect(toggleSymptom(["unknown"], "unknown")).toEqual([]);
    expect(toggleSymptom(["bleeding"], "other")).toEqual(["bleeding", "other"]);
    expect(
      detailsCondition({
        symptoms: ["bleeding", "other"],
        otherText: "  synthetic-other-injury  ",
        conscious: "yes",
      }),
    ).toEqual({
      symptoms: ["bleeding", "other"],
      otherText: "synthetic-other-injury",
      conscious: "yes",
    });
    expect(detailsCondition({ symptoms: ["other"], otherText: "  " })).toEqual({
      symptoms: ["other"],
    });
    expect(
      detailsCondition({ symptoms: ["bleeding"], otherText: "ignored" }),
    ).toEqual({
      symptoms: ["bleeding"],
    });
  });

  it("requires a kind for injured and otherText when other is selected", () => {
    const cat = animalKindByKey("domestic_cat");
    const dog = animalKindByKey("domestic_dog");
    expect(detailsCanContinue("injured", undefined, [], "")).toBe(false);
    expect(detailsCanContinue("injured", cat, ["other"], "")).toBe(false);
    expect(
      detailsCanContinue("injured", cat, ["other"], "synthetic-other-injury"),
    ).toBe(true);
    expect(detailsCanContinue("stray", undefined, [], "")).toBe(true);
    expect(shouldAskJuvenile("injured", dog)).toBe(false);
    expect(shouldAskJuvenile("injured", cat)).toBe(true);
    expect(
      groupedInjuredKinds()[0]?.kinds.some(
        (kind) => kind.key === "domestic_cat",
      ),
    ).toBe(true);
    expect(
      detailsSnapshot("injured", cat, {
        symptoms: ["bleeding"],
        isJuvenile: "no",
      }),
    ).toEqual({
      schemaVersion: 1,
      situationType: "injured",
      species: {
        source: "manual",
        groupKey: "domestic",
        categoryKey: "companion",
        kindKey: "domestic_cat",
      },
      condition: {
        symptoms: ["bleeding"],
        isJuvenile: "no",
      },
      mediaRecordIds: [],
    });
  });
});
