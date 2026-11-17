import { describe, expect, it } from "vitest";
import { DEFAULT_DESIGN, closestSwatches, estimate, lampAssembly, lampBase, parts, pinch, rgbToHex, wallLoops } from "@/lib/custom";

describe("custom studio rules", () => {
  it("waterproofing adds wall loops and weight", () => {
    const dry = { ...DEFAULT_DESIGN, form: "vase" as const, waterproof: false };
    const wet = { ...dry, waterproof: true };
    expect(wallLoops(dry)).toBe(2);
    expect(wallLoops(wet)).toBe(5);
    expect(estimate(wet).grams).toBeGreaterThan(estimate(dry).grams);
  });
  it("stacks at most six modules and sums their own heights", () => {
    const m = { shape: "cylinder" as const, height: 10, width: 16, color: null };
    const s = estimate({ ...DEFAULT_DESIGN, form: "stack", modules: Array(9).fill(m) });
    expect(s.modules).toBe(6);
    expect(s.totalHeight).toBe(60);
    const mixed = estimate({ ...DEFAULT_DESIGN, form: "stack", modules: [m, { ...m, shape: "donut", height: 5 }] });
    expect(mixed.totalHeight).toBe(15);
  });
  it("a table lamp base adds 6 cm plus its connecting stem, no base adds nothing", () => {
    const lamp = { ...DEFAULT_DESIGN, form: "table-lamp" as const, height: 24 };
    expect(estimate({ ...lamp, base: "box" }).totalHeight).toBe(34);
    expect(estimate({ ...lamp, base: "none" }).totalHeight).toBe(24);
  });
  it("touch points shape the width between a fixed top and bottom", () => {
    const pts = [{ t: 0.5, s: 0.5 }];
    expect(pinch(pts, 0)).toBe(1);
    expect(pinch(pts, 0.5)).toBe(0.5);
    expect(pinch(pts, 1)).toBe(1);
  });
  it("only lighting forms are charged a light kit", () => {
    const vase = estimate({ ...DEFAULT_DESIGN, form: "vase", light: true });
    const vaseOff = estimate({ ...DEFAULT_DESIGN, form: "vase", light: false });
    expect(vase.low).toBe(vaseOff.low);
  });
  it("matches any hex to the closest studio colour and converts RGB", () => {
    expect(closestSwatches("#c56b44")[0]?.name).toBe("Terracotta");
    expect(closestSwatches("not a colour")).toEqual([]);
    expect(rgbToHex(196, 106, 67)).toBe("#c46a43");
  });
});

describe("practical lamp assembly", () => {
  it("keeps base and shade shape, dimensions and touch points independent", () => {
    const base = { shape: "custom" as const, height: 12, width: 14, color: "#30302e", points: [{ t: 0.5, s: 0.6 }], taper: 0.3 };
    const d = { ...DEFAULT_DESIGN, form: "table-lamp" as const, lampBase: base, shadeShape: "cone" as const, height: 24, width: 30 };
    expect(parts(d)[0]).toEqual(base);
    expect(parts(d)[1]).toMatchObject({ shape: "cone", height: 24, width: 30 });
    expect(lampBase({ ...d, width: 36 })).toEqual(base);
  });
  it("places the shade above feet, base and connecting stem", () => {
    const d = { ...DEFAULT_DESIGN, form: "table-lamp" as const, legs: "tripod" as const, legHeight: 5, stemHeight: 4, height: 24 };
    expect(lampAssembly(d)).toMatchObject({ feetHeight: 5, baseHeight: 6, stemHeight: 4, shadeY: 15, totalHeight: 39 });
    expect(estimate(d).totalHeight).toBe(39);
  });
  it("uses a 27 mm E27 socket and shows it even with the light switched off", () => {
    expect(lampAssembly({ ...DEFAULT_DESIGN, light: false }).socketDiameter).toBe(2.7);
  });
  it("keeps older saved designs usable without new base fields", () => {
    expect(lampBase(DEFAULT_DESIGN)).toMatchObject({ height: 6, width: 11, shape: "cylinder" });
    expect(lampAssembly({ ...DEFAULT_DESIGN, form: "table-lamp", base: "none", legs: "four" }).shadeY).toBe(0);
  });
});

import { lightFitting } from "@/lib/custom";
describe("stack light fitting", () => {
  const mods = DEFAULT_DESIGN.modules;
  it("one lit module takes an E27 bulb", () => {
    expect(lightFitting({ modules: mods, lightFrom: 2, lightTo: 2, lightKind: "strip" }).fitting).toBe("E27 LED bulb");
  });
  it("several lit modules take an LED strip or tube", () => {
    expect(lightFitting({ modules: mods, lightFrom: 0, lightTo: 3, lightKind: "strip" })).toMatchObject({ count: 4, fitting: "LED strip" });
    expect(lightFitting({ modules: mods, lightFrom: 3, lightTo: 1, lightKind: "tube" })).toMatchObject({ from: 1, to: 3, fitting: "LED tube light" });
  });
  it("clamps the range when modules are removed", () => {
    expect(lightFitting({ modules: mods.slice(0, 2), lightFrom: 0, lightTo: 5, lightKind: "strip" })).toMatchObject({ from: 0, to: 1 });
  });
});
import { depositFor as _depositFor } from "@/lib/custom";
describe("custom design deposit", () => {
  it("is 20% of the shown estimate midpoint", () => {
    expect(_depositFor(2000, 3000)).toBe(500);
  });
});
