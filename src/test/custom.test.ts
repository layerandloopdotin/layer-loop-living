import { describe, expect, it } from "vitest";
import { DEFAULT_DESIGN, closestSwatches, estimate, pinch, rgbToHex, wallLoops } from "@/lib/custom";

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
  it("a table lamp base adds 6 cm, no base adds nothing", () => {
    const lamp = { ...DEFAULT_DESIGN, form: "table-lamp" as const, height: 24 };
    expect(estimate({ ...lamp, base: "box" }).totalHeight).toBe(30);
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

import { lightFitting, sketchProfile } from "@/lib/custom";
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
describe("sketch tracing", () => {
  it("traces a wider bottom than top", () => {
    const w = 40, h = 40, lum = new Float32Array(w * h).fill(1);
    for (let y = 5; y < 35; y++) { const half = 4 + (y - 5) / 2; lum[y * w + Math.round(20 - half)] = 0; lum[y * w + Math.round(20 + half)] = 0; }
    const r = sketchProfile(lum, w, h)!;
    expect(r.radii[0]).toBe(1);
    expect(r.radii[r.radii.length - 1]!).toBeLessThan(0.5);
  });
  it("returns null for a blank page", () => {
    expect(sketchProfile(new Float32Array(100).fill(1), 10, 10)).toBeNull();
  });
});
