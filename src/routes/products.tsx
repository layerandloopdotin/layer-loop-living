import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DarkHero, Page } from "@/components/site";
import { categories, spaces, products, slugify } from "@/lib/products";
import { formatPrice } from "@/lib/currency";

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
        <div key={cats.join()+mats.join()} className="grid content-start gap-6 animate-in fade-in duration-500 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <Link
              key={p.name}
              to="/product/$slug"
              params={{ slug: slugify(p.name) }}
              aria-label={p.name}
              className="group/tile block"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-xl transition-shadow duration-500 group-hover/tile:shadow-2xl">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/tile:scale-105"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.note}</p>
                </div>
                <span className="shrink-0 font-display font-semibold">{formatPrice(p.price)}</span>
              </div>
            </Link>
          ))}
          {!shown.length && <p className="text-muted-foreground">No objects match these filters.</p>}
        </div>
      </section>
    </Page>
  );
}
