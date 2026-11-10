import { describe, expect, it } from "vitest";
import { DEFAULT_DESIGN, closestSwatches, estimate, wallLoops } from "@/lib/custom";

describe("custom studio rules", () => {
  it("waterproofing adds wall loops and weight", () => {
    const dry = { ...DEFAULT_DESIGN, form: "vase" as const, waterproof: false };
    const wet = { ...dry, waterproof: true };
    expect(wallLoops(dry)).toBe(2);
    expect(wallLoops(wet)).toBe(5);
    expect(estimate(wet).grams).toBeGreaterThan(estimate(dry).grams);
  });
  it("stacking multiplies height up to six modules", () => {
    const s = estimate({ ...DEFAULT_DESIGN, form: "stack", height: 20, stack: 9 });
    expect(s.modules).toBe(6);
    expect(s.totalHeight).toBe(120);
  });
  it("only lighting forms are charged a light kit", () => {
    const vase = estimate({ ...DEFAULT_DESIGN, form: "vase", light: true });
    const vaseOff = estimate({ ...DEFAULT_DESIGN, form: "vase", light: false });
    expect(vase.low).toBe(vaseOff.low);
  });
  it("matches any hex to the closest studio colour", () => {
    expect(closestSwatches("#c56b44")[0]?.name).toBe("Terracotta");
    expect(closestSwatches("not a colour")).toEqual([]);
  });
});
