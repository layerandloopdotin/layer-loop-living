import { describe, expect, it } from "vitest";
import { engravingCost, engravingImages, engravingSchema } from "@/lib/engraving";

const rules = { enabled: true, price: 199, maxChars: 20, images: [] };
describe("engraving", () => {
  it("allows older products without example photos", () => {
    const legacy = { enabled: true, price: 199, maxChars: 20 };
    expect(engravingImages(legacy)).toEqual([]);
    expect(engravingSchema(legacy).safeParse({ text: "Asha" }).success).toBe(true);
  });
  it("keeps supplied example photos and omits empty ones", () => {
    expect(engravingImages({ images: ["", "  ", "/example.jpg"] })).toEqual(["/example.jpg"]);
    expect(engravingImages({ images: [] })).toEqual([]);
  });
  it("adds the engraving price only when text is chosen", () => {
    expect(engravingCost(rules, { text: "Asha", font: "Script" })).toBe(199);
    expect(engravingCost(rules, null)).toBe(0);
    expect(engravingCost({ ...rules, enabled: false }, { text: "Asha", font: "Script" })).toBe(0);
  });
  it("rejects text over the character limit", () => {
    expect(engravingSchema(rules).safeParse({ text: "x".repeat(21), font: "Script" }).success).toBe(false);
  });
  it("needs only words; remarks are optional but capped", () => {
    expect(engravingSchema(rules).safeParse({ text: "Asha" }).success).toBe(true);
    expect(engravingSchema(rules).safeParse({ text: "Asha", remarks: "Cursive please" }).success).toBe(true);
    expect(engravingSchema(rules).safeParse({ text: "Asha", remarks: "x".repeat(121) }).success).toBe(false);
  });
});

import { DEFAULT_DESIGN, estimate } from "@/lib/custom";
describe("custom design engraving", () => {
  it("raises the estimate when words are added", () => {
    const plain = estimate(DEFAULT_DESIGN), eng = estimate({ ...DEFAULT_DESIGN, engraving: { text: "Asha", font: "Script" } });
    expect(eng.high).toBeGreaterThan(plain.high);
  });
});
