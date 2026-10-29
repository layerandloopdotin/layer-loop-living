import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify, type Colour, type Pair } from "@/lib/catalog";
import { ImagesInput, inputCls, labelCls, RowTools } from "@/components/admin/fields";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: ProductEditor,
});

type Form = {
  name: string; slug: string; tagline: string; short_description: string; long_description: string;
  price: string; compare_at_price: string; featured: boolean; published: boolean;
  category_ids: string[]; space_ids: string[]; images: string[]; colors: Colour[]; specs: Pair[]; care: Pair[];
};

const emptyForm = (): Form => ({
  name: "", slug: "", tagline: "", short_description: "", long_description: "", price: "", compare_at_price: "",
  featured: false, published: true, category_ids: [], space_ids: [], images: [], colors: [],
  specs: ["Dimensions", "Weight", "Material", "Bulb", "Cable"].map((label) => ({ label, value: "" })),
  care: [{ label: "Cleaning", value: "" }, { label: "Wear & tear", value: "" }],
});

const asPairs = (v: unknown): Pair[] => (Array.isArray(v) ? v.map((x) => ({ label: String(x?.label ?? ""), value: String(x?.value ?? "") })) : []);
const asColours = (v: unknown): Colour[] => (Array.isArray(v) ? v.map((x) => ({ name: String(x?.name ?? ""), hex: String(x?.hex ?? "#cccccc"), images: Array.isArray(x?.images) ? x.images.map(String) : [] })) : []);
const move = <T,>(l: T[], i: number, d: number) => { const j = i + d; if (j < 0 || j >= l.length) return l; const n = [...l]; [n[i], n[j]] = [n[j]!, n[i]!]; return n; };

function Card({ title, help, children }: { title: string; help?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {help && <p className="mt-1 text-xs text-muted-foreground">{help}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}
const L = ({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) => (
  <label className="grid gap-1.5"><span className={labelCls}>{label}</span>{children}{help && <span className="text-xs text-muted-foreground">{help}</span>}</label>
);

function PairsEditor({ value, onChange, area }: { value: Pair[]; onChange: (v: Pair[]) => void; area?: boolean }) {
  return (
    <div className="space-y-2">
      {value.map((p, i) => (
        <div key={i} className="flex items-start gap-2">
          <input value={p.label} placeholder="Label" onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} className={`${inputCls} max-w-[11rem]`} />
          {area
            ? <textarea value={p.value} rows={2} placeholder="Text" onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} className={inputCls} />
            : <input value={p.value} placeholder="Value" onChange={(e) => onChange(value.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} className={inputCls} />}
          <RowTools onUp={() => onChange(move(value, i, -1))} onDown={() => onChange(move(value, i, 1))} onRemove={() => onChange(value.filter((_, k) => k !== i))} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { label: "", value: "" }])} className="inline-flex items-center gap-1 text-xs font-semibold"><Plus className="h-3.5 w-3.5" /> Add row</button>
    </div>
  );
}

function ProductEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const tax = useQuery({
    queryKey: ["admin", "taxonomy"],
    queryFn: async () => {
      const [c, s] = await Promise.all([supabase.from("categories").select("*").order("sort"), supabase.from("spaces").select("*").order("sort")]);
      return { categories: c.data ?? [], spaces: s.data ?? [] };
    },
  });
  const existing = useQuery({
    queryKey: ["admin", "product", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const [f, setF] = useState<Form | null>(isNew ? emptyForm() : null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    setF({
      name: p.name, slug: p.slug, tagline: p.tagline, short_description: p.short_description, long_description: p.long_description,
      price: String(p.price), compare_at_price: p.compare_at_price == null ? "" : String(p.compare_at_price),
      featured: p.featured, published: p.published, category_ids: p.category_ids, space_ids: p.space_ids, images: p.images,
      colors: asColours(p.colors), specs: asPairs(p.specs), care: asPairs(p.care),
    });
  }, [existing.data]);

  if (!f) return <Loader2 className="h-6 w-6 animate-spin" />;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((cur) => (cur ? { ...cur, [k]: v } : cur));
  const toggleId = (k: "category_ids" | "space_ids", v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  const setColour = (i: number, patch: Partial<Colour>) => set("colors", f.colors.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  const save = async () => {
    const price = Number(f.price);
    if (!f.name.trim()) { toast.error("Give the product a name"); return; }
    if (!f.slug.trim()) { toast.error("Add a web address"); return; }
    if (!Number.isFinite(price) || price < 0) { toast.error("Enter a valid price"); return; }
    if (!f.images.length && !f.colors.some((c) => c.images.length)) { toast.error("Add at least one photo"); return; }
    const row = {
      name: f.name.trim(), slug: slugify(f.slug), tagline: f.tagline, short_description: f.short_description, long_description: f.long_description,
      price, compare_at_price: f.compare_at_price ? Number(f.compare_at_price) : null, featured: f.featured, published: f.published,
      category_ids: f.category_ids, space_ids: f.space_ids, images: f.images,
      colors: f.colors.filter((c) => c.name.trim()) as unknown as Json,
      specs: f.specs.filter((s) => s.label.trim()) as unknown as Json,
      care: f.care.filter((s) => s.label.trim()) as unknown as Json,
    };
    setBusy(true);
    const res = isNew
      ? await supabase.from("products").insert({ ...row, sort: 999 }).select("id").single()
      : await supabase.from("products").update(row).eq("id", id).select("id").single();
    setBusy(false);
    if (res.error) { toast.error(res.error.code === "23505" ? "Another product already uses that web address" : res.error.message); return; }
    toast.success("Product saved");
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["site"] });
    if (isNew) navigate({ to: "/admin/products/$id", params: { id: res.data.id }, replace: true });
  };

  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground"}`;

  return (
    <div className="max-w-3xl pb-24">
      <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground">← All products</Link>
      <h1 className="mt-2 text-3xl font-bold">{isNew ? "New product" : f.name || "Product"}</h1>
      <div className="mt-8 space-y-6">
        <Card title="Basics">
          <L label="Name"><input value={f.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} className={inputCls} placeholder="The Stack Lamp" /></L>
          <L label="Tagline" help="The short line under the name, e.g. “Layered sculptural table lamp”."><input value={f.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} /></L>
          <L label="Web address" help={`layerandloop.in/product/${slugify(f.slug) || "…"}`}><input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} className={inputCls} /></L>
          <div className="grid gap-5 sm:grid-cols-2">
            <L label="Price (₹)"><input inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} className={inputCls} /></L>
            <L label="Compare-at price (₹, optional)" help="Shown struck through when higher than the price."><input inputMode="decimal" value={f.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} className={inputCls} /></L>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-primary" /> Featured — show in The Edit on the homepage</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="accent-primary" /> Visible on the website</label>
          </div>
        </Card>

        <Card title="Descriptions">
          <L label="Short description"><textarea rows={2} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} className={inputCls} /></L>
          <L label="Long description (About this product)"><textarea rows={6} value={f.long_description} onChange={(e) => set("long_description", e.target.value)} className={inputCls} /></L>
        </Card>

        <Card title="Category & spaces" help="Choose as many as apply. Add new ones under Categories & spaces.">
          <L label="Categories"><div className="flex flex-wrap gap-2">{tax.data?.categories.map((c) => <button type="button" key={c.id} onClick={() => toggleId("category_ids", c.id)} className={chip(f.category_ids.includes(c.id))}>{c.name}</button>)}</div></L>
          <L label="Spaces it suits"><div className="flex flex-wrap gap-2">{tax.data?.spaces.map((s) => <button type="button" key={s.id} onClick={() => toggleId("space_ids", s.id)} className={chip(f.space_ids.includes(s.id))}>{s.name}</button>)}</div></L>
        </Card>

        <Card title="Photos" help="Shown for every colour. The first photo is the cover. Add as many as you like.">
          <ImagesInput value={f.images} onChange={(v) => set("images", v)} />
        </Card>

        <Card title="Colours" help="Each colour has a swatch and its own photos. Clicking a swatch on the product page shows that colour's photos first.">
          {f.colors.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-3">
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : "#cccccc"} onChange={(e) => setColour(i, { hex: e.target.value })} className="h-10 w-12 rounded border border-border" aria-label="Swatch colour" />
                <input value={c.hex} onChange={(e) => setColour(i, { hex: e.target.value })} className={`${inputCls} w-28`} aria-label="Hex code" placeholder="#EDE6DA" />
                <input value={c.name} onChange={(e) => setColour(i, { name: e.target.value })} className={`${inputCls} flex-1`} placeholder="Colour name, e.g. Bone White" />
                <RowTools onUp={() => set("colors", move(f.colors, i, -1))} onDown={() => set("colors", move(f.colors, i, 1))} onRemove={() => set("colors", f.colors.filter((_, k) => k !== i))} />
              </div>
              <div className="mt-4"><ImagesInput value={c.images} onChange={(v) => setColour(i, { images: v })} /></div>
            </div>
          ))}
          <button type="button" onClick={() => set("colors", [...f.colors, { name: "", hex: "#cccccc", images: [] }])} className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:border-foreground"><Plus className="h-3.5 w-3.5" /> Add colour</button>
        </Card>

        <Card title="Size & specification" help="Dimensions, weight, material, bulb, cable — add or remove rows freely.">
          <PairsEditor value={f.specs} onChange={(v) => set("specs", v)} />
        </Card>

        <Card title="Object care & wear">
          <PairsEditor value={f.care} onChange={(v) => set("care", v)} area />
        </Card>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 py-3 pl-[17rem] pr-8 backdrop-blur">
        <div className="flex max-w-3xl items-center justify-end gap-3">
          {!isNew && <a href={`/product/${f.slug}`} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">View on site</a>}
          <button onClick={save} disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : isNew ? "Create product" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}
