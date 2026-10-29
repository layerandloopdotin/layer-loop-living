import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DarkHero, Page, ProductCard } from "@/components/site";
import { categories, spaces, products } from "@/lib/products";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Objects — Layer & Loop" },
      { name: "description", content: "Browse table, floor, pendant and sculptural lamps crafted for the modern home." },
      { property: "og:title", content: "All Objects — Layer & Loop" },
      { property: "og:description", content: "The full Layer & Loop lighting catalog." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { category?: string } =>
    typeof s["category"] === "string" ? { category: s["category"] } : {},
  component: Products,
});

function Products() {
  const { category } = Route.useSearch();
  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  useEffect(() => setCats(category ? [category] : []), [category]);
  const [mats, setMats] = useState<string[]>([]);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const shown = products.filter((p) => (!cats.length || cats.includes(p.category)) && (!mats.length || p.spaces.some((x) => mats.includes(x))));

  const Box = ({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-foreground" /> {label}
    </label>
  );

  return (
    <Page>
      <DarkHero title="ALL OBJECTS">
        <p className="mt-4 max-w-md text-ink-muted">Browse our full catalog of lighting, vases, collectibles and desk objects — crafted for homes, cafés, restaurants and studios.</p>
      </DarkHero>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <h3 className="font-display font-bold uppercase">Filters</h3>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Category</p>
          <div className="mt-3 space-y-2">
            <Box label="All Products" checked={!cats.length} onChange={() => setCats([])} />
            {categories.map((c) => <Box key={c} label={c} checked={cats.includes(c)} onChange={() => toggle(cats, setCats, c)} />)}
          </div>
          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">Filter by Space</p>
          <div className="mt-3 space-y-2">
            {spaces.map((m) => <Box key={m} label={m} checked={mats.includes(m)} onChange={() => toggle(mats, setMats, m)} />)}
          </div>
        </aside>
        <div key={cats.join()+mats.join()} className="group/grid grid content-start gap-6 animate-in fade-in duration-500 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <div key={p.name} className="relative rounded-2xl transition-all duration-500 ease-out [@media(hover:hover)]:group-hover/grid:opacity-80 [@media(hover:hover)]:group-hover/grid:blur-[2px] [@media(hover:hover)]:hover:z-10 [@media(hover:hover)]:hover:scale-[1.07] [@media(hover:hover)]:hover:!opacity-100 [@media(hover:hover)]:hover:!blur-none [@media(hover:hover)]:hover:bg-background [@media(hover:hover)]:hover:shadow-2xl [@media(hover:hover)]:hover:p-2">
              <ProductCard {...p} tall />
            </div>
          ))}
          {!shown.length && <p className="text-muted-foreground">No objects match these filters.</p>}
        </div>
      </section>
    </Page>
  );
}
