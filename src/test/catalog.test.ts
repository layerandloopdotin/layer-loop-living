import { describe, expect, it } from "vitest";
import {
  cultureFiltersForProduct,
  filterCatalogProducts,
  inWorld,
  normalizeCultureFilters,
  showsCustom,
  syncProductCultureFilters,
  worldCategories,
  featuredProducts,
  galleryFor,
  lightingCover,
  lightingFilterActive,
  slugify,
  toProduct,
  type ProductRow,
} from "@/lib/catalog";
import { defaults, mergeContent, sections } from "@/lib/cms-schema";

const row = (over: Partial<ProductRow> = {}): ProductRow => ({
  id: "1",
  slug: "terra",
  name: "Terra",
  tagline: "Warm ceramic lighting",
  short_description: "",
  long_description: "",
  price: 280,
  compare_at_price: null,
  featured: false,
  published: true,
  sort: 0,
  category_ids: ["c1", "c2"],
  space_ids: ["s1"],
  images: ["https://x/shared.jpg"],
  colors: [
    { name: "Sage", hex: "#8E9A7E", images: ["https://x/sage.jpg"] },
    { name: "Charcoal", hex: "#2E2B28", images: [] },
  ],
  specs: [],
  care: [],
  ...over,
});

describe("catalog", () => {
  it("offers collective lighting only for the Lighting filter", () => {
    expect(lightingFilterActive(["Lighting"])).toBe(true);
    expect(lightingFilterActive([])).toBe(false);
    expect(lightingFilterActive(["Lighting", "Collectibles"])).toBe(false);
    expect(lightingFilterActive(["Vases and Planters"])).toBe(false);
  });

  it("switches the matched lighting cover on and restores the same off cover", () => {
    const p = { image: "lamp-off.jpg", categories: ["Lighting"], litImages: ["lamp-on.jpg"] };
    expect(lightingCover(p, true)).toBe("lamp-on.jpg");
    expect(lightingCover(p, false)).toBe("lamp-off.jpg");
  });

  it("keeps unpaired and non-lighting products unchanged", () => {
    expect(lightingCover({ image: "off.jpg", categories: ["Lighting"] }, true)).toBe("off.jpg");
    expect(
      lightingCover({ image: "vase.jpg", categories: ["Vases"], litImages: ["on.jpg"] }, true),
    ).toBe("vase.jpg");
  });
  it("shows the chosen colour's photos before the shared photos", () => {
    const p = toProduct(row(), [], []);
    expect(galleryFor(p, "Sage")).toEqual(["https://x/sage.jpg", "https://x/shared.jpg"]);
    expect(galleryFor(p, "Charcoal")).toEqual(["https://x/shared.jpg"]);
  });

  it("puts a product in every category and space it is assigned to", () => {
    const p = toProduct(
      row(),
      [
        { id: "c1", name: "Lighting", image: "", sort: 1 },
        { id: "c2", name: "Desk", image: "", sort: 2 },
      ],
      [{ id: "s1", name: "The Study", sort: 1 }],
    );
    expect(p.categories).toEqual(["Lighting", "Desk"]);
    expect(p.spaces).toEqual(["The Study"]);
  });

  it("The Edit lists only products marked featured", () => {
    expect(
      featuredProducts([
        { featured: true, n: 1 },
        { featured: false, n: 2 },
      ]).map((p) => p.n),
    ).toEqual([1]);
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

describe("space and culture worlds", () => {
  const products = [
    { world: "space" as const, categories: ["Lighting"] },
    { world: "culture" as const, categories: ["Collectibles"] },
  ];
  it("keeps each world's products apart", () => {
    expect(inWorld(products, "culture")).toHaveLength(1);
    expect(inWorld(products, "space")[0]?.categories).toEqual(["Lighting"]);
  });
  it("lists only categories belonging to or used in a world", () => {
    const cats = [
      { name: "Lighting", world: "space" },
      { name: "Collectibles", world: "culture" },
      { name: "Quirky Desk", world: "culture" },
    ];
    expect(worldCategories(cats, products, "space").map((c) => c.name)).toEqual(["Lighting"]);
    expect(worldCategories(cats, products, "culture").map((c) => c.name)).toEqual([
      "Collectibles",
      "Quirky Desk",
    ]);
  });
  it("offers custom design only in Space", () => {
    expect(showsCustom("space")).toBe(true);
    expect(showsCustom("culture")).toBe(false);
  });
});

describe("CMS homepage & catalog separation", () => {
  it("exposes all three homepages (home, space, culture) with matching schema sections", () => {
    expect(sections.home.title).toBe("Landing homepage");
    expect(sections.space.title).toBe("Space homepage");
    expect(sections.culture.title).toBe("Culture homepage");
    expect(defaults.home.coverSlides.length).toBeGreaterThan(0);
    expect(sections.space.groups.some((g) => g.fields.some((f) => f.k === "editSubtitle"))).toBe(
      true,
    );
    expect(sections.culture.groups.some((g) => g.fields.some((f) => f.k === "ctaLabel"))).toBe(
      true,
    );
  });

  it("separates Space and Culture All-Objects copy from unified Product Details", () => {
    const spaceCatalog = mergeContent("catalogSpace", { heroTitle: "CUSTOM SPACE" });
    const cultureCatalog = mergeContent("catalogCulture", {
      heroTitle: "CUSTOM CULTURE",
      collectionLabel: "Filter by Theme",
    });
    const productDetails = mergeContent("catalog", undefined);
    expect(spaceCatalog.heroTitle).toBe("CUSTOM SPACE");
    expect(cultureCatalog.heroTitle).toBe("CUSTOM CULTURE");
    expect(cultureCatalog.collectionLabel).toBe("Filter by Theme");
    expect(defaults.catalogCulture.collectionLabel).toBe("Filter by Setup");
    expect(defaults.catalogSpace.heroText).not.toBe(defaults.catalogCulture.heroText);
    expect(productDetails.taxNote).toBe("Inclusive of all taxes");
  });
});

describe("culture separate filter section", () => {
  const filters = normalizeCultureFilters(undefined);
  const cultureItems = [
    {
      id: "uuid-1",
      slug: "pit-stop-pen-stack",
      featured: true,
      categories: ["Statement Pieces"],
      spaces: [],
      drop: true,
    },
    {
      id: "uuid-2",
      slug: "puffer-caddy",
      featured: true,
      categories: ["Quirky Desk"],
      spaces: [],
      drop: false,
    },
    {
      id: "uuid-3",
      slug: "cosmo-cat",
      featured: true,
      categories: ["Collectibles"],
      spaces: [],
      drop: true,
    },
  ];

  it("provides pre-seeded Culture setup filters separate from Space rooms", () => {
    expect(filters.map((f) => f.name)).toContain("Desk Setup");
    expect(filters.map((f) => f.name)).toContain("Collector's Shelf");
    expect(cultureFiltersForProduct(cultureItems[2]!, filters)).toEqual([
      "Collector's Shelf",
      "Giftable",
    ]);
  });

  it("filters Culture products by selected setups and Limited Drops flag", () => {
    expect(
      filterCatalogProducts(cultureItems, {
        cultureSetups: ["Desk Setup"],
        cultureFilters: filters,
      }).map((p) => p.slug),
    ).toEqual(["pit-stop-pen-stack", "puffer-caddy"]);

    expect(
      filterCatalogProducts(cultureItems, {
        cultureSetups: ["Desk Setup"],
        dropsOnly: true,
        cultureFilters: filters,
      }).map((p) => p.slug),
    ).toEqual(["pit-stop-pen-stack"]);
  });

  it("syncs Culture filter assignments cleanly when saving a product in Admin", () => {
    const updated = syncProductCultureFilters(
      filters,
      { id: "uuid-99", slug: "neo-duck", prevSlug: "old-duck" },
      ["collectors-shelf"],
    );
    const shelf = updated.find((f) => f.id === "collectors-shelf");
    const desk = updated.find((f) => f.id === "desk-setup");
    expect(shelf?.productIds).toContain("uuid-99");
    expect(shelf?.productSlugs).toContain("neo-duck");
    expect(desk?.productIds).not.toContain("uuid-99");
  });
});
