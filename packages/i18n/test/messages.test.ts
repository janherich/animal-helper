import { describe, expect, it } from "vitest";

import { t } from "../src/index.js";

describe("sk-SK customer shell copy", () => {
  it("resolves shell keys and rejects unknown paths", () => {
    expect(t("customer.appName")).toBe("Zvierací ombudsman");
    expect(t("customer.contact.submit")).toBe("Odoslať a ukončiť");
    expect(t("customer.durability.received")).toBe("Nahlásenie bolo prijaté");
    expect(() => t("customer.unknown")).toThrow(/Missing locale key/);
  });
});
