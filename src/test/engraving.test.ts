import { describe, expect, it } from "vitest";
import { engravingCost, engravingSchema } from "@/lib/engraving";

const rules = { enabled: true, price: 199, maxChars: 20, images: [] };
describe("engraving", () => {
  it("adds the engraving price only when text is chosen", () => {
    expect(engravingCost(rules, { text: "Asha", font: "Script" })).toBe(199);
    expect(engravingCost(rules, null)).toBe(0);
    expect(engravingCost({ ...rules, enabled: false }, { text: "Asha", font: "Script" })).toBe(0);
  });
  it("rejects text over the character limit", () => {
    expect(engravingSchema(rules).safeParse({ text: "x".repeat(21), font: "Script" }).success).toBe(false);
  });
  it("needs only words and a font, no placement", () => {
    expect(engravingSchema(rules).safeParse({ text: "Asha", font: "Handwritten" }).success).toBe(true);
    expect(engravingSchema(rules).safeParse({ text: "Asha", font: "Comic" }).success).toBe(false);
  });
});

import { DEFAULT_DESIGN, estimate } from "@/lib/custom";
describe("custom design engraving", () => {
  it("raises the estimate when words are added", () => {
    const plain = estimate(DEFAULT_DESIGN), eng = estimate({ ...DEFAULT_DESIGN, engraving: { text: "Asha", font: "Script" } });
    expect(eng.high).toBeGreaterThan(plain.high);
  });
});
