import { describe, expect, it } from "vitest";
import { engravingCost, engravingSchema } from "@/lib/engraving";

const rules = { enabled: true, price: 199, maxChars: 20, placements: ["Front", "Base"] };
describe("engraving", () => {
  it("adds the engraving price only when text is chosen", () => {
    expect(engravingCost(rules, { text: "Asha", font: "Script", placement: "Front" })).toBe(199);
    expect(engravingCost(rules, null)).toBe(0);
    expect(engravingCost({ ...rules, enabled: false }, { text: "Asha", font: "Script", placement: "Front" })).toBe(0);
  });
  it("rejects text over the character limit", () => {
    expect(engravingSchema(rules).safeParse({ text: "x".repeat(21), font: "Script", placement: "Front" }).success).toBe(false);
  });
  it("rejects placements the product doesn't allow", () => {
    expect(engravingSchema(rules).safeParse({ text: "Asha", font: "Script", placement: "Back" }).success).toBe(false);
  });
});
