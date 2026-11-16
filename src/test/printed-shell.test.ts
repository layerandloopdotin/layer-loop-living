import { expect, it } from "vitest";
import * as THREE from "three";
import { shellClosure } from "@/lib/printed-shell";

it("seals the base underside at the centre, but leaves lamp shade openings with thick rims", () => {
  const ring = (radius: number) => {
    const points = [0, 1].flatMap((y) => Array.from({ length: 9 }, (_, i) => [radius * Math.cos(i * Math.PI / 4), y, radius * Math.sin(i * Math.PI / 4)]).flat());
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3)); return g;
  };
  const outer = ring(1), inner = ring(0.9);
  const solid = shellClosure(outer, inner, 8, 1, true, true).getAttribute("position");
  const shade = shellClosure(outer, inner, 8, 1, false).getAttribute("position");
  expect(Array.from({ length: solid.count }, (_, i) => Math.hypot(solid.getX(i), solid.getZ(i))).some((r) => r === 0)).toBe(true);
  expect(Array.from({ length: shade.count }, (_, i) => Math.hypot(shade.getX(i), shade.getZ(i))).every((r) => r > 0.89)).toBe(true);
  expect(shade.count).toBe(96);
});

it("closes lamp end plates except for a small holder aperture, rather than leaving the full shell hollow", () => {
  const ring = (radius: number) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 1].flatMap(y => Array.from({ length: 9 }, (_, i) => [radius * Math.cos(i * Math.PI / 4), y, radius * Math.sin(i * Math.PI / 4)]).flat()), 3));
    return geometry;
  };
  const plate = shellClosure(ring(1), ring(0.9), 8, 1, true, true, 0.16).getAttribute("position");
  const radii = Array.from({ length: plate.count }, (_, i) => Math.hypot(plate.getX(i), plate.getZ(i)));
  expect(Math.min(...radii)).toBeCloseTo(0.16);
  expect(Math.max(...radii)).toBeCloseTo(1);
  expect(plate.count).toBe(96);
});