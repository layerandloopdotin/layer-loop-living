import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  asWorld,
  defaultCultureColours,
  normalizeCultureFilters,
  slugify,
  syncProductCultureFilters,
  type Colour,
  type Pair,
  type World,
} from "@/lib/catalog";
import {
  ImageInput,
  ImagesInput,
  inputBase,
  inputCls,
  labelCls,
  RowTools,
} from "@/components/admin/fields";
import type { Json } from "@/integrations/supabase/types";
import { inventoryQuantitySchema } from "@/lib/inventory";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  head: () => ({
    meta: [
      { title: "Product Editor — Layer & Loop CMS" },
      { name: "description", content: "Edit Layer & Loop product photos and details." },
      { property: "og:title", content: "Product Editor — Layer & Loop CMS" },
      { property: "og:description", content: "Edit Layer & Loop product photos and details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { world?: World } => ({
    ...(s["world"] === "culture" || s["world"] === "space" ? { world: asWorld(s["world"]) } : {}),
  }),
  component: ProductEditor,
});

type Form = {
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  long_description: string;
  price: string;
  compare_at_price: string;
  featured: boolean;
  published: boolean;
  is_drop: boolean;
  world: "space" | "culture";
  inventory_quantity: string;
  category_ids: string[];
  space_ids: string[];
  culture_filter_ids: string[];
  images: string[];
  colors: Colour[];
  specs: Pair[];
  care: Pair[];
  variants: { name: string; price: string; image: string }[];
  engravable: boolean;
  engraving_price: string;
  engraving_max_chars: string;
  engraving_images: string[];
  lit_images: string[];
};

const defaultSpecsFor = (world: World): Pair[] =>
  (world === "culture"
    ? ["Dimensions", "Weight", "Material", "Finish"]
    : ["Dimensions", "Weight", "Material", "Bulb", "Cable"]
  ).map((label) => ({ label, value: "" }));

const emptyForm = (world: World = "space"): Form => ({
  name: "",
  slug: "",
  tagline: "",
  short_description: "",
  long_description: "",
  price: "",
  compare_at_price: "",
  featured: false,
  is_drop: false,
  published: true,
  world,
  category_ids: [],
  space_ids: [],
  culture_filter_ids: [],
  images: [],
  colors: [],
  variants: [],
  engravable: true,
  engraving_price: "199",
  engraving_max_chars: "20",
  engraving_images: [],
  lit_images: [],
  inventory_quantity: "0",
  specs: defaultSpecsFor(world),
  care: [
    { label: "Cleaning", value: "" },
    { label: "Wear & tear", value: "" },
  ],
});

const asPairs = (v: unknown): Pair[] =>
  Array.isArray(v)
    ? v.map((x) => ({ label: String(x?.label ?? ""), value: String(x?.value ?? "") }))
    : [];
const asColours = (v: unknown): Colour[] =>
  Array.isArray(v)
    ? v.map((x) => ({
        name: String(x?.name ?? ""),
        hex: String(x?.hex ?? "#cccccc"),
        images: Array.isArray(x?.images) ? x.images.map(String) : [],
      }))
    : [];
const move = <T,>(l: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= l.length) return l;
  const n = [...l];
  [n[i], n[j]] = [n[j]!, n[i]!];
  return n;
};

function Card({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {help && <p className="mt-1 text-xs text-muted-foreground">{help}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}
const L = ({
  label,
  children,
  help,
}: {
  label: string;
  children: React.ReactNode;
  help?: string;
}) => (
  <label className="grid gap-1.5">
    <span className={labelCls}>{label}</span>
    {children}
    {help && <span className="text-xs text-muted-foreground">{help}</span>}
  </label>
);

function PairsEditor({
  value,
  onChange,
  area,
}: {
  value: Pair[];
  onChange: (v: Pair[]) => void;
  area?: boolean;
}) {
  return (
    <div className="space-y-2">
      {value.map((p, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            value={p.label}
            placeholder="Label"
            onChange={(e) =>
              onChange(value.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))
            }
            className={`${inputBase} w-44 shrink-0`}
          />
          {area ? (
            <textarea
              value={p.value}
              rows={2}
              placeholder="Text"
              onChange={(e) =>
                onChange(value.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))
              }
              className={inputCls}
            />
          ) : (
            <input
              value={p.value}
              placeholder="Value"
              onChange={(e) =>
                onChange(value.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))
              }
              className={inputCls}
            />
          )}
          <RowTools
            onUp={() => onChange(move(value, i, -1))}
            onDown={() => onChange(move(value, i, 1))}
            onRemove={() => onChange(value.filter((_, k) => k !== i))}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { label: "", value: "" }])}
        className="inline-flex items-center gap-1 text-xs font-semibold"
      >
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  );
}

function ProductEditor() {
  const { id } = Route.useParams();
  const { world: searchWorld } = Route.useSearch();
  const isNew = id === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const tax = useQuery({
    queryKey: ["admin", "taxonomy"],
    queryFn: async () => {
      const [c, s, cf] = await Promise.all([
        supabase.from("categories").select("*").order("sort"),
        supabase.from("spaces").select("*").order("sort"),
        supabase.from("site_content").select("data").eq("key", "cultureFilters").maybeSingle(),
      ]);
      return {
        categories: c.data ?? [],
        spaces: s.data ?? [],
        cultureFilters: normalizeCultureFilters(cf.data?.data),
      };
    },
  });
  const existing = useQuery({
    queryKey: ["admin", "product", id],
    enabled: !isNew,
    queryFn: async () => {
      const [{ data, error }, inventory] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("product_inventory").select("quantity").eq("product_id", id).maybeSingle(),
      ]);
      if (error) throw error;
      if (inventory.error) throw inventory.error;
      return { ...data, inventory_quantity: String(inventory.data?.quantity ?? 0) };
    },
  });
  const [f, setF] = useState<Form | null>(() =>
    isNew ? emptyForm(searchWorld === "culture" ? "culture" : "space") : null,
  );
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [cultureFiltersTouched, setCultureFiltersTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) return;
    setCreatedId(null);
    setSlugTouched(false);
    setCultureFiltersTouched(false);
    setF(emptyForm(searchWorld === "culture" ? "culture" : "space"));
  }, [isNew, searchWorld]);

  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    const savedColours = asColours(p.colors);
    setCultureFiltersTouched(false);
    setF({
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      short_description: p.short_description,
      long_description: p.long_description,
      price: String(p.price),
      compare_at_price: p.compare_at_price == null ? "" : String(p.compare_at_price),
      inventory_quantity: p.inventory_quantity,
      featured: p.featured,
      is_drop: !!p.is_drop,
      published: p.published,
      world: p.world === "culture" ? "culture" : "space",
      category_ids: p.category_ids,
      space_ids: p.space_ids,
      culture_filter_ids: [],
      images: p.images,
      colors: savedColours.length ? savedColours : defaultCultureColours(p.slug),
      specs: asPairs(p.specs),
      care: asPairs(p.care),
      variants: Array.isArray(p.variants)
        ? p.variants.map((x) => {
            const v = x as { name?: unknown; price?: unknown; image?: unknown };
            return {
              name: String(v?.name ?? ""),
              price: String(v?.price ?? "0"),
              image: String(v?.image ?? ""),
            };
          })
        : [],
      engravable: p.engravable,
      engraving_price: String(p.engraving_price),
      engraving_max_chars: String(p.engraving_max_chars),
      engraving_images: p.engraving_images ?? [],
      lit_images: (p as { lit_images?: string[] }).lit_images ?? [],
    });
  }, [existing.data]);

  useEffect(() => {
    const p = existing.data;
    const cfList = tax.data?.cultureFilters;
    if (!p || !cfList || cultureFiltersTouched) return;
    const matchedFilters = cfList
      .filter((opt) => opt.productIds.includes(p.id) || opt.productSlugs.includes(p.slug))
      .map((opt) => opt.id);
    setF((cur) => (cur ? { ...cur, culture_filter_ids: matchedFilters } : cur));
  }, [tax.data?.cultureFilters, existing.data, cultureFiltersTouched]);

  if (!f) return <Loader2 className="h-6 w-6 animate-spin" />;
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setF((cur) => (cur ? { ...cur, [k]: v } : cur));
  const toggleId = (k: "category_ids" | "space_ids" | "culture_filter_ids", v: string) => {
    if (k === "culture_filter_ids") setCultureFiltersTouched(true);
    set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  };
  const setColour = (i: number, patch: Partial<Colour>) =>
    set(
      "colors",
      f.colors.map((c, k) => (k === i ? { ...c, ...patch } : c)),
    );

  const save = async () => {
    const quantity = inventoryQuantitySchema.safeParse(f.inventory_quantity);
    if (!quantity.success) {
      toast.error(quantity.error.issues[0]?.message ?? "Enter a valid inventory quantity");
      return;
    }
    const price = Number(f.price);
    if (!f.name.trim()) {
      toast.error("Give the product a name");
      return;
    }
    if (!f.slug.trim()) {
      toast.error("Add a web address");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!f.images.length && !f.colors.some((c) => c.images.length)) {
      toast.error("Add at least one photo");
      return;
    }
    const row = {
      name: f.name.trim(),
      slug: slugify(f.slug),
      tagline: f.tagline,
      short_description: f.short_description,
      long_description: f.long_description,
      price,
      compare_at_price: f.compare_at_price ? Number(f.compare_at_price) : null,
      featured: f.featured,
      is_drop: f.is_drop,
      published: f.published,
      world: f.world,
      category_ids: f.category_ids,
      space_ids: f.space_ids,
      images: f.images,
      colors: f.colors.filter((c) => c.name.trim()) as unknown as Json,
      specs: f.specs.filter((s) => s.label.trim()) as unknown as Json,
      care: f.care.filter((s) => s.label.trim()) as unknown as Json,
      variants: f.variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          name: v.name.trim(),
          price: Number(v.price || 0),
          image: v.image,
        })) as unknown as Json,
      engravable: f.engravable,
      engraving_price: Math.max(0, Number(f.engraving_price) || 0),
      engraving_max_chars: Math.min(
        60,
        Math.max(1, Math.round(Number(f.engraving_max_chars) || 20)),
      ),
      engraving_images: f.engraving_images,
      lit_images: f.lit_images,
    };
    if (f.variants.some((v) => v.name.trim() && !(Number(v.price || 0) >= 0))) {
      toast.error("Enter a valid extra price for each variant");
      return;
    }
    setBusy(true);
    const res =
      isNew && !createdId
        ? await supabase
            .from("products")
            .insert({ ...row, sort: f.world === "culture" ? 1999 : 999 })
            .select("id")
            .single()
        : await supabase
            .from("products")
            .update(row)
            .eq("id", createdId ?? id)
            .select("id")
            .single();
    if (res.error || !res.data) {
      setBusy(false);
      toast.error(
        res.error?.code === "23505"
          ? "Another product already uses that web address"
          : (res.error?.message ?? "Couldn't save product"),
      );
      return;
    }
    if (isNew) setCreatedId(res.data.id);
    const inventory = await supabase
      .from("product_inventory")
      .upsert({ product_id: res.data.id, quantity: quantity.data });
    if (inventory.error) {
      setBusy(false);
      toast.error(
        `Product saved, but inventory wasn't saved: ${inventory.error.message}. Please retry.`,
      );
      return;
    }
    const existingFilters = tax.data?.cultureFilters ?? normalizeCultureFilters(null);
    const hadAnyFilter = existingFilters.some(
      (opt) =>
        opt.productIds.includes(res.data.id) ||
        opt.productSlugs.includes(row.slug) ||
        (existing.data?.slug ? opt.productSlugs.includes(existing.data.slug) : false),
    );
    if (f.world === "culture" || cultureFiltersTouched || hadAnyFilter) {
      const nextFilters = syncProductCultureFilters(
        existingFilters,
        {
          id: res.data.id,
          slug: row.slug,
          ...(existing.data?.slug ? { prevSlug: existing.data.slug } : {}),
        },
        f.world === "culture" ? f.culture_filter_ids : [],
      );
      const cfSave = await supabase
        .from("site_content")
        .upsert({ key: "cultureFilters", data: { items: nextFilters } as unknown as Json });
      if (cfSave.error) {
        setBusy(false);
        toast.error(
          `Product saved, but Culture filters weren't updated: ${cfSave.error.message}. Please retry.`,
        );
        return;
      }
    }
    setBusy(false);
    toast.success("Product saved");
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["site"] });
    if (isNew) {
      navigate({
        to: "/admin/products/$id",
        params: { id: res.data.id },
        search: { world: f.world },
        replace: true,
      });
    }
  };

  const changeWorld = (next: World) => {
    setF((cur) => {
      if (!cur || cur.world === next) return cur;
      const keepBlankSpecs = isNew && cur.specs.every((s) => !s.value.trim());
      return {
        ...cur,
        world: next,
        specs: keepBlankSpecs ? defaultSpecsFor(next) : cur.specs,
      };
    });
  };

  const worldCats = (tax.data?.categories ?? []).filter(
    (c) => (c.world === "culture" ? "culture" : "space") === f.world,
  );
  const crossCats = (tax.data?.categories ?? []).filter(
    (c) =>
      (c.world === "culture" ? "culture" : "space") !== f.world && f.category_ids.includes(c.id),
  );

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground"}`;

  return (
    <div className="max-w-3xl pb-24">
      <Link
        to="/admin/products"
        search={{ world: f.world }}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All {f.world === "culture" ? "Culture" : "Space"} products
      </Link>
      <h1 className="mt-2 text-3xl font-bold">
        {isNew ? `New ${f.world === "culture" ? "Culture" : "Space"} product` : f.name || "Product"}
      </h1>
      <div className="mt-8 space-y-6">
        <Card
          title="World categorization"
          help="Choose whether this piece lives in Space or Culture. Categories and product options update to match."
        >
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Product world">
            <button
              type="button"
              role="radio"
              aria-checked={f.world === "space"}
              onClick={() => changeWorld("space")}
              className={`rounded-xl border p-4 text-left transition ${f.world === "space" ? "border-foreground bg-background ring-1 ring-foreground" : "border-border hover:border-foreground/50"}`}
            >
              <p className="font-display text-sm font-bold uppercase tracking-wide">Space</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Calm sculptural lighting, vases, planters and everyday living objects.
              </p>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={f.world === "culture"}
              onClick={() => changeWorld("culture")}
              className={`rounded-xl border p-4 text-left transition ${f.world === "culture" ? "border-pop-blue bg-pop-blue/10 ring-1 ring-pop-blue" : "border-border hover:border-foreground/50"}`}
            >
              <p className="font-display text-sm font-bold uppercase tracking-wide text-pop-blue">
                Culture
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pop collectibles, limited drops, quirky desk pieces and statement objects.
              </p>
            </button>
          </div>
        </Card>

        <Card title="Basics">
          <L label="Name">
            <input
              value={f.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className={inputCls}
              placeholder={f.world === "culture" ? "Pit Stop Pen Stack" : "The Stack Lamp"}
            />
          </L>
          <L
            label="Tagline"
            help="The short line under the name, e.g. “Layered sculptural table lamp”."
          >
            <input
              value={f.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className={inputCls}
            />
          </L>
          <L label="Web address" help={`layerandloop.in/product/${slugify(f.slug) || "…"}`}>
            <input
              value={f.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              className={inputCls}
            />
          </L>
          <div className="grid gap-5 sm:grid-cols-2">
            <L label="Price (₹)">
              <input
                inputMode="decimal"
                value={f.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputCls}
              />
            </L>
            <L
              label="Compare-at price (₹, optional)"
              help="Shown struck through when higher than the price."
            >
              <input
                inputMode="decimal"
                value={f.compare_at_price}
                onChange={(e) => set("compare_at_price", e.target.value)}
                className={inputCls}
              />
            </L>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="accent-primary"
              />{" "}
              Featured — show in its world's featured edit
            </label>
            {f.world === "culture" && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={f.is_drop}
                  onChange={(e) => set("is_drop", e.target.checked)}
                  className="accent-primary"
                />{" "}
                Drop — show in the Culture Drops rail
              </label>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.published}
                onChange={(e) => set("published", e.target.checked)}
                className="accent-primary"
              />{" "}
              Visible on the website
            </label>
          </div>
        </Card>

        <Card
          title="Inventory"
          help="Private stock tracking — only visible in the CMS. This does not change availability on the website."
        >
          <L label="Inventory quantity">
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={f.inventory_quantity}
              onChange={(e) => set("inventory_quantity", e.target.value)}
              className={inputCls}
            />
          </L>
        </Card>

        <Card title="Descriptions">
          <L label="Short description">
            <textarea
              rows={2}
              value={f.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              className={inputCls}
            />
          </L>
          <L label="Long description (About this product)">
            <textarea
              rows={6}
              value={f.long_description}
              onChange={(e) => set("long_description", e.target.value)}
              className={inputCls}
            />
          </L>
        </Card>

        <Card
          title={f.world === "culture" ? "Culture categories & setups" : "Category & spaces"}
          help="Only categories and filter options belonging to the selected world are shown. Manage them under Categories & filters."
        >
          <L label={f.world === "culture" ? "Culture categories" : "Space categories"}>
            <div className="flex flex-wrap gap-2">
              {worldCats.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleId("category_ids", c.id)}
                  className={chip(f.category_ids.includes(c.id))}
                >
                  {c.name}
                </button>
              ))}
              {!worldCats.length && (
                <p className="text-xs text-muted-foreground">
                  No {f.world === "culture" ? "Culture" : "Space"} categories yet — add one in{" "}
                  <Link to="/admin/taxonomy" className="underline">
                    Categories &amp; filters
                  </Link>
                  .
                </p>
              )}
            </div>
          </L>
          {crossCats.length > 0 && (
            <L
              label="Assigned from the other world"
              help="Click to remove if this product moved worlds."
            >
              <div className="flex flex-wrap gap-2">
                {crossCats.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleId("category_ids", c.id)}
                    className={chip(true)}
                  >
                    {c.name} ({c.world === "culture" ? "Culture" : "Space"}) ×
                  </button>
                ))}
              </div>
            </L>
          )}
          {f.world === "culture" && (
            <L
              label="Culture setups & filters"
              help="Used in the separate Filter by Setup section on Culture products."
            >
              <div className="flex flex-wrap gap-2">
                {(tax.data?.cultureFilters ?? []).map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => toggleId("culture_filter_ids", opt.id)}
                    className={chip(f.culture_filter_ids.includes(opt.id))}
                  >
                    {opt.name}
                  </button>
                ))}
                {tax.isSuccess && !(tax.data?.cultureFilters ?? []).length && (
                  <p className="text-xs text-muted-foreground">
                    No Culture filters yet — add one in{" "}
                    <Link to="/admin/taxonomy" className="underline">
                      Categories &amp; filters
                    </Link>
                    .
                  </p>
                )}
              </div>
            </L>
          )}
          {(f.world === "space" || f.space_ids.length > 0) && (
            <L label="Spaces it suits">
              <div className="flex flex-wrap gap-2">
                {tax.data?.spaces.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleId("space_ids", s.id)}
                    className={chip(f.space_ids.includes(s.id))}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </L>
          )}
        </Card>

        <Card
          title="Photos"
          help="Shown for every colour. The first photo is the cover. Add as many as you like."
        >
          <ImagesInput value={f.images} onChange={(v) => set("images", v)} />
        </Card>

        <Card
          title="Colours"
          help="Each colour has a swatch and its own photos. Clicking a swatch on the product page shows that colour's photos first."
        >
          {f.colors.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : "#cccccc"}
                  onChange={(e) => setColour(i, { hex: e.target.value })}
                  className="h-10 w-12 rounded border border-border"
                  aria-label="Swatch colour"
                />
                <input
                  value={c.hex}
                  onChange={(e) => setColour(i, { hex: e.target.value })}
                  className={`${inputBase} w-28`}
                  aria-label="Hex code"
                  placeholder="#EDE6DA"
                />
                <input
                  value={c.name}
                  onChange={(e) => setColour(i, { name: e.target.value })}
                  className={`${inputBase} flex-1`}
                  placeholder="Colour name, e.g. Bone White"
                />
                <RowTools
                  onUp={() => set("colors", move(f.colors, i, -1))}
                  onDown={() => set("colors", move(f.colors, i, 1))}
                  onRemove={() =>
                    set(
                      "colors",
                      f.colors.filter((_, k) => k !== i),
                    )
                  }
                />
              </div>
              <div className="mt-4">
                <ImagesInput value={c.images} onChange={(v) => setColour(i, { images: v })} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("colors", [...f.colors, { name: "", hex: "#cccccc", images: [] }])}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:border-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add colour
          </button>
        </Card>

        <Card
          title="Variants (optional)"
          help="E.g. cable options for pendant lights. The first one is selected by default. Extra price is added to the product price — use 0 for the standard option. Leave empty to hide variants."
        >
          {f.variants.map((v, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <input
                  value={v.name}
                  placeholder="Variant, e.g. Golden wire"
                  onChange={(e) =>
                    set(
                      "variants",
                      f.variants.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)),
                    )
                  }
                  className={inputCls}
                />
                <input
                  value={v.price}
                  inputMode="decimal"
                  placeholder="+ ₹"
                  aria-label="Extra price (₹)"
                  onChange={(e) =>
                    set(
                      "variants",
                      f.variants.map((x, k) => (k === i ? { ...x, price: e.target.value } : x)),
                    )
                  }
                  className={`${inputBase} w-28 shrink-0`}
                />
                <RowTools
                  onUp={() => set("variants", move(f.variants, i, -1))}
                  onDown={() => set("variants", move(f.variants, i, 1))}
                  onRemove={() =>
                    set(
                      "variants",
                      f.variants.filter((_, k) => k !== i),
                    )
                  }
                />
              </div>
              <div className="mt-3 max-w-xs">
                <p className={`${labelCls} mb-1.5`}>Photo (optional, shown on hover)</p>
                <ImageInput
                  value={v.image}
                  onChange={(img) =>
                    set(
                      "variants",
                      f.variants.map((x, k) => (k === i ? { ...x, image: img } : x)),
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("variants", [...f.variants, { name: "", price: "0", image: "" }])}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:border-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add variant
          </button>
        </Card>

        {(f.world === "space" || f.lit_images.length > 0) && (
          <Card
            title="Lights on photos"
            help="Optional matching photos for the Lighting catalog switch. The first photo must match the main cover's position, framing and background, with only the lamp switched on. The main cover is used for lights off; products without a matching photo keep their cover."
          >
            <ImagesInput value={f.lit_images} onChange={(v) => set("lit_images", v)} />
          </Card>
        )}
        <Card
          title="Engraving"
          help="Lets customers add a name, initials or a date on the product page. The extra price is added per item."
        >
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.engravable}
              onChange={(e) => set("engravable", e.target.checked)}
              className="h-4 w-4 accent-primary"
            />{" "}
            Offer engraving on this product
          </label>
          {f.engravable && (
            <div className="flex flex-wrap gap-4">
              <label className={labelCls}>
                Extra price (₹)
                <input
                  value={f.engraving_price}
                  inputMode="decimal"
                  onChange={(e) => set("engraving_price", e.target.value)}
                  className={`${inputBase} mt-1.5 block w-28`}
                />
              </label>
              <label className={labelCls}>
                Max characters
                <input
                  value={f.engraving_max_chars}
                  inputMode="numeric"
                  onChange={(e) => set("engraving_max_chars", e.target.value)}
                  className={`${inputBase} mt-1.5 block w-28`}
                />
              </label>
            </div>
          )}
          {f.engravable && (
            <div>
              <p className={`${labelCls} mb-1.5`}>
                Example photos (optional) — show how engraving looks on this piece. Hidden on the
                product page when empty.
              </p>
              <ImagesInput
                value={f.engraving_images}
                onChange={(v) => set("engraving_images", v)}
              />
            </div>
          )}
        </Card>

        <Card
          title="Size & specification"
          help="Dimensions, weight, material, bulb, cable — add or remove rows freely."
        >
          <PairsEditor value={f.specs} onChange={(v) => set("specs", v)} />
        </Card>

        <Card title="Object care & wear">
          <PairsEditor value={f.care} onChange={(v) => set("care", v)} area />
        </Card>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 py-3 pl-[17rem] pr-8 backdrop-blur">
        <div className="flex max-w-3xl items-center justify-end gap-3">
          {!isNew && (
            <a
              href={`/product/${f.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View on site
            </a>
          )}
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
