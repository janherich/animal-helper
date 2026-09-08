import { describe, expect, it } from "vitest";

import {
  animalKindByKey,
  animalKinds,
  customerWalkableSteps,
  flowFor,
  kindsForSituation,
  matrixWalkableSteps,
  nextCustomerPath,
  resolveGuidanceWalk,
} from "../src/index.js";

describe("guidance walk resolver", () => {
  it("resolves companion injured rows onto the catalogued screen sequence", () => {
    const walk = resolveGuidanceWalk("injured", "domestic_cat");
    expect(walk.reason).toBe("ready");
    expect(walk.flowKey).toBe("injured_companion");
    expect(walk.steps.map((step) => step.screenKey)).toEqual(
      flowFor("injured_companion").screens,
    );
    expect(walk.steps.map((step) => step.screenKey)).toContain("w14");
    expect(walk.steps.find((step) => step.screenKey === "w04")?.status).toBe(
      "skipped",
    );
  });

  it("uses the dangerous-exotic branch for a tiger and keeps stray as a stub", () => {
    expect(resolveGuidanceWalk("injured", "exotic_tiger").flowKey).toBe(
      "injured_exotic_dangerous",
    );
    expect(
      resolveGuidanceWalk("injured", "exotic_tiger").steps.map(
        (step) => step.screenKey,
      ),
    ).toEqual(flowFor("injured_exotic_dangerous").screens);
    expect(resolveGuidanceWalk("stray", "domestic_cat")).toMatchObject({
      reason: "stub",
      steps: [],
    });
    expect(resolveGuidanceWalk("injured", "domestic_rat").reason).toBe(
      "missing_content",
    );
    expect(resolveGuidanceWalk("injured", undefined).reason).toBe(
      "missing_kind",
    );
  });

  it("collapses the customer PWA onto implemented routes plus planned placeholders", () => {
    expect(
      customerWalkableSteps("injured", "domestic_cat").map((step) => step.path),
    ).toEqual([
      "/w01",
      "/w03",
      "/w09",
      "/w14",
      "/w15",
      "/w18",
      "/w21",
      "/w22",
      "/w23",
      "/w24",
      "/thank-you",
    ]);
    expect(
      customerWalkableSteps("injured", "exotic_tiger").map((step) => step.path),
    ).toEqual(["/w01", "/w03", "/w09", "/w20", "/w24", "/thank-you"]);
    expect(
      customerWalkableSteps("injured", "wild_mole").map((step) => step.path),
    ).toEqual([
      "/w01",
      "/w03",
      "/w09",
      "/w14",
      "/w21",
      "/w26",
      "/w24",
      "/thank-you",
    ]);
    expect(nextCustomerPath("/w09", "injured", "domestic_cat")).toBe("/w14");
    expect(nextCustomerPath("/w23", "injured", "domestic_cat")).toBe("/w24");
    expect(nextCustomerPath("/w09", "injured", "exotic_tiger")).toBe("/w20");
    expect(nextCustomerPath("/w09", "stray", "domestic_cat")).toBe("/w24");
    expect(nextCustomerPath("/w09", "injured", undefined)).toBeUndefined();
    expect(
      customerWalkableSteps("injured", undefined).map((step) => step.path),
    ).toEqual(["/w01", "/w03", "/w09"]);
  });

  it("keeps the matrix preview on intended screens, including post-contact W25", () => {
    expect(
      matrixWalkableSteps("injured", "domestic_cat").map(
        (step) => step.screenKey,
      ),
    ).toEqual([
      "w01",
      "w03a",
      "w03b",
      "w09",
      "w09b",
      "w11",
      "w14",
      "w15",
      "w18",
      "w21",
      "w22",
      "w23",
      "w24",
      "w25a",
      "w25b",
    ]);
    expect(
      matrixWalkableSteps("cruelty", "domestic_cat").map(
        (step) => step.screenKey,
      ),
    ).toEqual(["w01", "w02", "w03a", "w03b", "w06a", "w06b", "w11", "w24"]);
  });

  it("lists situation rows in group order and walks every ready injured kind", () => {
    const injured = kindsForSituation("injured");
    expect(injured.length).toBe(
      animalKinds.filter((kind) => kind.injured !== undefined).length,
    );
    expect(injured[0]?.groupKey).toBe("domestic");
    expect(animalKindByKey("domestic_cat").labelSk).toBe("Mačka");

    for (const kind of injured) {
      const paths = customerWalkableSteps("injured", kind.key).map(
        (step) => step.path,
      );
      expect(paths[0]).toBe("/w01");
      expect(paths).toContain("/w24");
      expect(paths.at(-1)).toBe("/thank-you");
      expect(new Set(paths).size).toBe(paths.length);
    }
  });
});
