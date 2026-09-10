import { describe, expect, it } from "vitest";

import {
  parseWalkView,
  walkViewFixtures,
  walkViewSchema,
} from "../src/index.js";

describe("walk view contract", () => {
  it("accepts a fixture for every customer screen kind", () => {
    for (const fixture of Object.values(walkViewFixtures)) {
      const parsed = parseWalkView(fixture);
      expect(parsed.success).toBe(true);
      if (!parsed.success) {
        throw new Error(`expected ${fixture.screen} fixture to parse`);
      }
      expect(parsed.data.screen).toBe(fixture.screen);
      expect(parsed.data.path).toBe(fixture.path);
    }
  });

  it("rejects an unknown screen and extra fields", () => {
    expect(
      walkViewSchema.safeParse({
        ...walkViewFixtures.location,
        screen: "unknown",
      }).success,
    ).toBe(false);
    expect(
      parseWalkView({
        ...walkViewFixtures.thanks,
        extra: true,
      }).success,
    ).toBe(false);
  });
});
