import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  bundledContentHash,
  bundledGuidanceDocument,
  bundledPublicGuidance,
  canonicalizeGuidanceDocument,
  copyLooksSafe,
  guidanceLines,
  itemsForScreen,
  parseGuidanceDocument,
  parsePublicGuidance,
  resolveKindItems,
} from "../src/index.js";

describe("bundled injured guidance", () => {
  it("keeps a stable document hash matching the generated fallback", () => {
    const document = bundledGuidanceDocument();
    const hash = createHash("sha256")
      .update(canonicalizeGuidanceDocument(document))
      .digest("hex");
    expect(hash).toBe(bundledContentHash());
    expect(document.cells).toHaveLength(660);
  });

  it("resolves cat warnings and municipality contact, and tiger 112 without volunteers", () => {
    const document = bundledGuidanceDocument();
    const cat = resolveKindItems("domestic_cat", document);
    const doNot = cat.find((item) => item.instructionKey === "warning.do_not");
    expect(doNot?.screenKey).toBe("w14");
    expect(doNot?.polarity).toBe("do_not");
    expect(doNot?.slots["warning.do_not"] ?? "").toContain("mačku");
    expect(
      cat.find((item) => item.instructionKey === "contact.primary")?.action,
    ).toEqual({
      kind: "call-contact",
      targetKey: "municipality_capture",
    });
    expect(itemsForScreen(cat, "w15").length).toBeGreaterThan(0);

    const tiger = resolveKindItems("exotic_tiger", document);
    expect(
      tiger.find((item) => item.instructionKey === "contact.primary"),
    ).toMatchObject({
      screenKey: "w20",
      action: { kind: "call-contact", targetKey: "emergency_112" },
    });
    expect(
      tiger.find((item) => item.instructionKey === "volunteers"),
    ).toBeUndefined();
    expect(
      tiger.find((item) => item.instructionKey === "warning.do_not"),
    ).toBeUndefined();
  });

  it("parses the public bundled payload and rejects phones, URLs, and unknown keys", () => {
    const publicGuidance = bundledPublicGuidance();
    expect(parsePublicGuidance(publicGuidance).source).toBe("bundled");
    expect(publicGuidance.kinds.domestic_cat?.items.length).toBeGreaterThan(0);
    expect(copyLooksSafe("Zavolajte na 112")).toBe(true);
    expect(copyLooksSafe("http://example.test")).toBe(false);
    expect(copyLooksSafe("volajte +421 900 000 000")).toBe(false);
    expect(guidanceLines("• one\n• two")).toEqual(["one", "two"]);
    expect(() =>
      parseGuidanceDocument({
        copy: {},
        cells: [
          {
            kindKey: "domestic_cat",
            instructionKey: "invented",
            applicability: "on",
            sortOrder: 1,
            copy: {},
          },
        ],
      }),
    ).toThrow(/unknown instruction/);
  });
});
