import { describe, expect, it } from "vitest";
import { featuredProducts, galleryFor, slugify, toProduct, type ProductRow } from "@/lib/catalog";
import { mergeContent } from "@/lib/cms-schema";

const row = (over: Partial<ProductRow> = {}): ProductRow => ({
  id: "1", slug: "terra", name: "Terra", tagline: "Warm ceramic lighting", short_description: "", long_description: "",
  price: 280, compare_at_price: null, featured: false, published: true, sort: 0,
  category_ids: ["c1", "c2"], space_ids: ["s1"], images: ["https://x/shared.jpg"],
  colors: [{ name: "Sage", hex: "#8E9A7E", images: ["https://x/sage.jpg"] }, { name: "Charcoal", hex: "#2E2B28", images: [] }],
  specs: [], care: [], ...over,
});

describe("catalog", () => {
  it("shows the chosen colour's photos before the shared photos", () => {
    const p = toProduct(row(), [], []);
    expect(galleryFor(p, "Sage")).toEqual(["https://x/sage.jpg", "https://x/shared.jpg"]);
    expect(galleryFor(p, "Charcoal")).toEqual(["https://x/shared.jpg"]);
  });

  it("puts a product in every category and space it is assigned to", () => {
    const p = toProduct(row(), [{ id: "c1", name: "Lighting", image: "", sort: 1 }, { id: "c2", name: "Desk", image: "", sort: 2 }], [{ id: "s1", name: "The Study", sort: 1 }]);
    expect(p.categories).toEqual(["Lighting", "Desk"]);
    expect(p.spaces).toEqual(["The Study"]);
  });

  it("The Edit lists only products marked featured", () => {
    expect(featuredProducts([{ featured: true, n: 1 }, { featured: false, n: 2 }]).map((p) => p.n)).toEqual([1]);
  });

  it("makes clean product links from names", () => {
    expect(slugify("The Stack Lamp ")).toBe("the-stack-lamp");
  });

  it("renamed navigation labels replace the defaults", () => {
    const s = mergeContent("settings", { nav: [{ label: "Collection", path: "/products" }] });
    expect(s.nav).toEqual([{ label: "Collection", path: "/products" }]);
    expect(s.email).toBe("hello@layerandloop.in");
  });
});
