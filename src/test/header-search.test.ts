import { describe, expect, it } from "vitest";
import { searchProducts } from "@/lib/catalog";

const items = [
  { name: "Stack Lamp", note: "", categories: ["Lighting"], spaces: ["Bedroom"] },
  { name: "Ripple Vase", note: "", categories: ["Vases and Planters"], spaces: ["Living room"] },
];
describe("search", () => {
  it("matches by category", () => expect(searchProducts(items, "lighting").map((p) => p.name)).toEqual(["Stack Lamp"]));
  it("matches by name", () => expect(searchProducts(items, "vase").map((p) => p.name)).toEqual(["Ripple Vase"]));
  it("empty query returns nothing", () => expect(searchProducts(items, " ")).toEqual([]));
});
