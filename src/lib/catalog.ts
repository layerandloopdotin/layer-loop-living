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
  id: string; slug: string; name: string; tagline: string; short_description: string; long_description: string;
  price: number; compare_at_price: number | null; featured: boolean; published: boolean; sort: number;
  category_ids: string[]; space_ids: string[]; images: string[]; colors: unknown; specs: unknown; care: unknown; variants?: unknown;
  engravable?: boolean; engraving_price?: number; engraving_max_chars?: number; engraving_placements?: string[]; engraving_images?: string[]; lit_images?: string[]; world?: string; is_drop?: boolean;
};

export type Product = {
  id: string; slug: string; name: string; note: string; short: string; long: string;
  price: number; compareAt: number | null; featured: boolean;
  image: string; images: string[]; colours: Colour[];
  categories: string[]; spaces: string[]; specs: Pair[]; care: Pair[]; variants: Variant[];
  engraving: EngravingRules;
  litImages: string[];
  world: World;
  drop: boolean;
};

const pairs = (v: unknown): Pair[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x === "object").map((x) => ({ label: String(x.label ?? ""), value: String(x.value ?? "") })).filter((x) => x.label || x.value) : [];

const colours = (v: unknown): Colour[] =>
  Array.isArray(v)
    ? v.filter((x) => x && typeof x === "object").map((x) => ({
        name: String(x.name ?? ""),
        hex: String(x.hex ?? "#cccccc"),
        images: Array.isArray(x.images) ? x.images.map(String).filter(Boolean) : [],
      }))
    : [];

export const variants = (v: unknown): Variant[] =>
  Array.isArray(v)
    ? v.filter((x) => x && typeof x === "object" && String(x.name ?? "").trim()).map((x) => ({ name: String(x.name).trim(), price: Math.max(0, Number(x.price) || 0), image: String(x.image ?? "") }))
    : [];

/** Unit price including the chosen variant's extra cost. */
export const unitPrice = (p: Pick<Product, "price" | "variants"> & { engraving?: EngravingRules }, variant?: string, engraving?: Engraving) =>
  p.price + (p.variants.find((v) => v.name === variant)?.price ?? 0) + (p.engraving ? engravingCost(p.engraving, engraving) : 0);

export const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function toProduct(r: ProductRow, cats: Category[], spaces: Space[]): Product {
  const images = (r.images ?? []).filter(Boolean);
  const cs = colours(r.colors);
  const firstColourImage = cs.find((c) => c.images.length)?.images[0];
  return {
    id: r.id, slug: r.slug, name: r.name, note: r.tagline, short: r.short_description || r.tagline, long: r.long_description,
    price: Number(r.price), compareAt: r.compare_at_price == null ? null : Number(r.compare_at_price), featured: r.featured,
    image: img(images[0] ?? firstColourImage ?? ""),
    images: images.map(img),
    colours: cs.map((c) => ({ ...c, images: c.images.map(img) })),
    categories: cats.filter((c) => r.category_ids?.includes(c.id)).map((c) => c.name),
    spaces: spaces.filter((s) => r.space_ids?.includes(s.id)).map((s) => s.name),
    specs: pairs(r.specs), care: pairs(r.care), variants: variants(r.variants).map((v) => ({ ...v, image: v.image ? img(v.image) : "" })),
    engraving: { enabled: !!r.engravable, price: Number(r.engraving_price ?? 199), maxChars: Number(r.engraving_max_chars ?? 20), images: (r.engraving_images ?? []).filter(Boolean).map(img) },
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
export function lightingCover(p: Pick<Product, "image" | "categories"> & { litImages?: string[] }, on: boolean): string {
  return on && p.categories.some((c) => c.toLowerCase() === "lighting")
    ? p.litImages?.[0] || p.image
    : p.image;
}

/** Simple catalogue search over names, categories, spaces and taglines. */
export function searchProducts<T extends { name: string; note: string; categories: string[]; spaces: string[] }>(list: T[], q: string): T[] {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return list.filter((p) => {
    const hay = [p.name, p.note, ...p.categories, ...p.spaces].join(" ").toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export const featuredProducts = <T extends { featured: boolean }>(list: T[]) => list.filter((p) => p.featured);

/** Products belonging to one world. */
export const inWorld = <T extends { world: World }>(list: T[], w: World): T[] => list.filter((p) => p.world === w);
/** Categories shown for a world: its own categories that hold at least one of its products. */
export function worldCategories<C extends { name: string; world?: string }>(cats: C[], products: { world: World; categories: string[] }[], w: World): C[] {
  const used = new Set(inWorld(products, w).flatMap((p) => p.categories));
  return cats.filter((c) => asWorld(c.world) === w || used.has(c.name));
}
/** Custom design only exists in the Space world. */
export const showsCustom = (w: World) => w === "space";
