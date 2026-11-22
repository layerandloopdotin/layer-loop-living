// Shapes database rows into what the shop pages use. Browser-safe.
import { img } from "@/lib/media";
import { engravingCost, type Engraving, type EngravingRules } from "@/lib/engraving";

export type Pair = { label: string; value: string };
export type Variant = { name: string; price: number; image: string };
export type Colour = { name: string; hex: string; images: string[] };
export type World = "space" | "culture";
export const asWorld = (v: unknown): World => (v === "culture" ? "culture" : "space");
export type Category = { id: string; name: string; image: string; sort: number; world?: string };
export type Space = { id: string; name: string; sort: number };

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  short_description: string;
  long_description: string;
  price: number;
  compare_at_price: number | null;
  featured: boolean;
  published: boolean;
  sort: number;
  category_ids: string[];
  space_ids: string[];
  images: string[];
  colors: unknown;
  specs: unknown;
  care: unknown;
  variants?: unknown;
  engravable?: boolean;
  engraving_price?: number;
  engraving_max_chars?: number;
  engraving_placements?: string[];
  engraving_images?: string[];
  lit_images?: string[];
  world?: string;
  is_drop?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  note: string;
  short: string;
  long: string;
  price: number;
  compareAt: number | null;
  featured: boolean;
  image: string;
  images: string[];
  colours: Colour[];
  categories: string[];
  spaces: string[];
  specs: Pair[];
  care: Pair[];
  variants: Variant[];
  engraving: EngravingRules;
  litImages: string[];
  world: World;
  drop: boolean;
};

const pairs = (v: unknown): Pair[] =>
  Array.isArray(v)
    ? v
        .filter((x) => x && typeof x === "object")
        .map((x) => ({ label: String(x.label ?? ""), value: String(x.value ?? "") }))
        .filter((x) => x.label || x.value)
    : [];

const colours = (v: unknown): Colour[] =>
  Array.isArray(v)
    ? v
        .filter((x) => x && typeof x === "object")
        .map((x) => ({
          name: String(x.name ?? ""),
          hex: String(x.hex ?? "#cccccc"),
          images: Array.isArray(x.images) ? x.images.map(String).filter(Boolean) : [],
        }))
    : [];

const CULTURE_DEFAULT_COLOURS: Record<string, Colour[]> = {
  "pit-stop-pen-stack": [
    { name: "Track Charcoal", hex: "#242426", images: [] },
    { name: "Apex Orange", hex: "#FF6B2C", images: [] },
    { name: "Electric Blue", hex: "#2563EB", images: [] },
    { name: "Chalk Cream", hex: "#F4EFE6", images: [] },
    { name: "Signal Red", hex: "#DC2626", images: [] },
  ],
  "puffer-caddy": [
    { name: "Electric Blue", hex: "#2563EB", images: [] },
    { name: "Pop Orange", hex: "#FF6B2C", images: [] },
    { name: "Bone Cream", hex: "#F4EFE6", images: [] },
    { name: "Obsidian", hex: "#1E1E22", images: [] },
  ],
  "cosmo-cat": [
    { name: "Pop Orange", hex: "#FF6B2C", images: [] },
    { name: "Cobalt Blue", hex: "#2563EB", images: [] },
    { name: "Starlight Cream", hex: "#F4EFE6", images: [] },
    { name: "Graphite", hex: "#2E2B28", images: [] },
  ],
};

/** Default swatch presets for pre-seeded Culture items when no custom colours are saved yet. */
export function defaultCultureColours(slug: string): Colour[] {
  return (CULTURE_DEFAULT_COLOURS[slug] ?? []).map((c) => ({ ...c, images: [...c.images] }));
}

export const variants = (v: unknown): Variant[] =>
  Array.isArray(v)
    ? v
        .filter((x) => x && typeof x === "object" && String(x.name ?? "").trim())
        .map((x) => ({
          name: String(x.name).trim(),
          price: Math.max(0, Number(x.price) || 0),
          image: String(x.image ?? ""),
        }))
    : [];

/** Unit price including the chosen variant's extra cost. */
export const unitPrice = (
  p: Pick<Product, "price" | "variants"> & { engraving?: EngravingRules },
  variant?: string,
  engraving?: Engraving,
) =>
  p.price +
  (p.variants.find((v) => v.name === variant)?.price ?? 0) +
  (p.engraving ? engravingCost(p.engraving, engraving) : 0);

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function toProduct(r: ProductRow, cats: Category[], spaces: Space[]): Product {
  const images = (r.images ?? []).filter(Boolean);
  const rawCs = colours(r.colors);
  const cs = rawCs.length ? rawCs : defaultCultureColours(r.slug);
  const firstColourImage = cs.find((c) => c.images.length)?.images[0];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    note: r.tagline,
    short: r.short_description || r.tagline,
    long: r.long_description,
    price: Number(r.price),
    compareAt: r.compare_at_price == null ? null : Number(r.compare_at_price),
    featured: r.featured,
    image: img(images[0] ?? firstColourImage ?? ""),
    images: images.map(img),
    colours: cs.map((c) => ({ ...c, images: c.images.map(img) })),
    categories: cats.filter((c) => r.category_ids?.includes(c.id)).map((c) => c.name),
    spaces: spaces.filter((s) => r.space_ids?.includes(s.id)).map((s) => s.name),
    specs: pairs(r.specs),
    care: pairs(r.care),
    variants: variants(r.variants).map((v) => ({ ...v, image: v.image ? img(v.image) : "" })),
    engraving: {
      enabled: !!r.engravable,
      price: Number(r.engraving_price ?? 199),
      maxChars: Number(r.engraving_max_chars ?? 20),
      images: (r.engraving_images ?? []).filter(Boolean).map(img),
    },
    litImages: (r.lit_images ?? []).filter(Boolean).map(img),
    world: asWorld(r.world),
    drop: !!r.is_drop,
  };
}

/** Photos for the product page: the chosen colour's own photos first, then the shared ones. */
export function galleryFor(p: Pick<Product, "images" | "colours">, colourName?: string): string[] {
  const own = p.colours.find((c) => c.name === colourName)?.images ?? [];
  const all = [...own, ...p.images];
  return all.length ? all : p.colours.flatMap((c) => c.images).slice(0, 1);
}

/** Only the exclusive Lighting filter exposes the collective light switch. */
export function lightingFilterActive(categories: string[]): boolean {
  return categories.length === 1 && categories[0]?.toLowerCase() === "lighting";
}

/** A matched lit cover replaces only Lighting items; missing pairs keep their cover. */
export function lightingCover(
  p: Pick<Product, "image" | "categories"> & { litImages?: string[] },
  on: boolean,
): string {
  return on && p.categories.some((c) => c.toLowerCase() === "lighting")
    ? p.litImages?.[0] || p.image
    : p.image;
}

/** Simple catalogue search over names, categories, spaces and taglines. */
export function searchProducts<
  T extends { name: string; note: string; categories: string[]; spaces: string[] },
>(list: T[], q: string): T[] {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return list.filter((p) => {
    const hay = [p.name, p.note, ...p.categories, ...p.spaces].join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export const featuredProducts = <T extends { featured: boolean }>(list: T[]) =>
  list.filter((p) => p.featured);

/** Products belonging to one world. */
export const inWorld = <T extends { world: World }>(list: T[], w: World): T[] =>
  list.filter((p) => p.world === w);
/** Categories shown for a world: its own categories that hold at least one of its products. */
export function worldCategories<C extends { name: string; world?: string }>(
  cats: C[],
  products: { world: World; categories: string[] }[],
  w: World,
): C[] {
  const used = new Set(inWorld(products, w).flatMap((p) => p.categories));
  return cats.filter((c) => asWorld(c.world) === w || used.has(c.name));
}
/** Custom design only exists in the Space world. */
export const showsCustom = (w: World) => w === "space";

export type CultureFilterOption = {
  id: string;
  name: string;
  productIds: string[];
  productSlugs: string[];
};

export const DEFAULT_CULTURE_FILTERS: CultureFilterOption[] = [
  {
    id: "desk-setup",
    name: "Desk Setup",
    productIds: [],
    productSlugs: ["pit-stop-pen-stack", "puffer-caddy"],
  },
  {
    id: "collectors-shelf",
    name: "Collector's Shelf",
    productIds: [],
    productSlugs: ["cosmo-cat", "pit-stop-pen-stack"],
  },
  {
    id: "giftable",
    name: "Giftable",
    productIds: [],
    productSlugs: ["pit-stop-pen-stack", "puffer-caddy", "cosmo-cat"],
  },
];

const cloneCultureFilters = (items: CultureFilterOption[]): CultureFilterOption[] =>
  items.map((x) => ({
    id: x.id,
    name: x.name,
    productIds: [...x.productIds],
    productSlugs: [...x.productSlugs],
  }));

/** Parse persisted `cultureFilters` document from `site_content`, falling back to built-in defaults if not yet saved. */
export function normalizeCultureFilters(raw: unknown): CultureFilterOption[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : null;
  if (!list) return cloneCultureFilters(DEFAULT_CULTURE_FILTERS);
  return list
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x, idx) => {
      const name = String(x["name"] ?? "").trim();
      const id = String(x["id"] ?? "").trim() || slugify(name) || `culture-filter-${idx + 1}`;
      const productIds = Array.isArray(x["productIds"])
        ? x["productIds"].map(String).filter(Boolean)
        : [];
      const productSlugs = Array.isArray(x["productSlugs"])
        ? x["productSlugs"].map(String).filter(Boolean)
        : [];
      return { id, name, productIds, productSlugs };
    })
    .filter((x) => x.name.length > 0);
}

const matchesCultureOption = (
  p: Pick<Product, "id" | "slug">,
  opt: Pick<CultureFilterOption, "productIds" | "productSlugs">,
) => opt.productIds.includes(p.id) || opt.productSlugs.includes(p.slug);

/** Names of Culture filter options assigned to a given product. */
export function cultureFiltersForProduct(
  p: Pick<Product, "id" | "slug">,
  filters: CultureFilterOption[],
): string[] {
  return filters.filter((f) => matchesCultureOption(p, f)).map((f) => f.name);
}

/** Whether a product matches all active Culture setup filters. */
export function matchesCultureFilterSelection(
  p: Pick<Product, "id" | "slug">,
  selectedNames: string[],
  filters: CultureFilterOption[],
): boolean {
  if (!selectedNames.length) return true;
  return filters.some((f) => selectedNames.includes(f.name) && matchesCultureOption(p, f));
}

/** Filters a product pool across world-specific Category, Space / Culture Setup, Featured, and Drops controls. */
export function filterCatalogProducts<
  T extends Pick<Product, "id" | "slug" | "featured" | "categories" | "spaces" | "drop">,
>(
  pool: T[],
  opts: {
    featured?: boolean;
    categories?: string[];
    spaces?: string[];
    cultureSetups?: string[];
    dropsOnly?: boolean;
    cultureFilters?: CultureFilterOption[];
  },
): T[] {
  const cats = opts.categories ?? [];
  const spaces = opts.spaces ?? [];
  const setups = opts.cultureSetups ?? [];
  const allCultureFilters = opts.cultureFilters ?? [];
  return pool.filter(
    (p) =>
      (!opts.featured || p.featured) &&
      (!opts.dropsOnly || p.drop) &&
      (!cats.length || p.categories.some((x) => cats.includes(x))) &&
      (!spaces.length || p.spaces.some((x) => spaces.includes(x))) &&
      matchesCultureFilterSelection(p, setups, allCultureFilters),
  );
}

/** Update `cultureFilters` membership lists when saving a product in Admin. */
export function syncProductCultureFilters(
  filters: CultureFilterOption[],
  product: { id: string; slug: string; prevSlug?: string },
  selectedFilterIds: string[],
): CultureFilterOption[] {
  const dropSlugs = new Set([product.slug, product.prevSlug].filter(Boolean));
  return filters.map((opt) => {
    const cleanIds = opt.productIds.filter((id) => id !== product.id);
    const cleanSlugs = opt.productSlugs.filter((s) => !dropSlugs.has(s));
    if (selectedFilterIds.includes(opt.id)) {
      return {
        ...opt,
        productIds: [...cleanIds, product.id],
        productSlugs: [...cleanSlugs, product.slug],
      };
    }
    return {
      ...opt,
      productIds: cleanIds,
      productSlugs: cleanSlugs,
    };
  });
}
