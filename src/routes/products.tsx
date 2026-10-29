import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DarkHero, Page, WishButton } from "@/components/site";
import { formatPrice } from "@/lib/currency";
import { useSite } from "@/lib/site";

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
  const site = useSite();
  const c = site.content("catalog");
  const { category } = Route.useSearch();
  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  useEffect(() => setCats(category ? [category] : []), [category]);
  const [spaces, setSpaces] = useState<string[]>([]);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const shown = site.products.filter((p) => (!cats.length || p.categories.some((x) => cats.includes(x))) && (!spaces.length || p.spaces.some((x) => spaces.includes(x))));

  const Box = ({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-foreground" /> {label}
    </label>
  );

  return (
    <Page>
      <DarkHero title={c.heroTitle}>
        <p className="mt-4 max-w-md text-ink-muted">{c.heroText}</p>
      </DarkHero>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <h3 className="font-display font-bold uppercase">{c.filtersTitle}</h3>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">{c.categoryLabel}</p>
          <div className="mt-3 space-y-2">
            <Box label={c.allLabel} checked={!cats.length} onChange={() => setCats([])} />
            {site.categories.map((x) => <Box key={x.id} label={x.name} checked={cats.includes(x.name)} onChange={() => toggle(cats, setCats, x.name)} />)}
          </div>
          {site.spaces.length > 0 && <>
            <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">{c.spaceLabel}</p>
            <div className="mt-3 space-y-2">
              {site.spaces.map((m) => <Box key={m.id} label={m.name} checked={spaces.includes(m.name)} onChange={() => toggle(spaces, setSpaces, m.name)} />)}
            </div>
          </>}
        </aside>
        <div key={cats.join() + spaces.join()} className="product-grid grid content-start gap-6 animate-in fade-in duration-500 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <div key={p.id} className="product-card group relative">
              <Link to="/product/$slug" params={{ slug: p.slug }} aria-label={p.name} className="block">
                <div className="product-frame aspect-[4/5] overflow-hidden rounded-xl">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.note}</p>
                  </div>
                  <span className="shrink-0 font-display font-semibold">{formatPrice(p.price)}</span>
                </div>
              </Link>
              <WishButton slug={p.slug} name={p.name} className="absolute right-3 top-3 z-10" />
            </div>
          ))}
          {!shown.length && <p className="text-muted-foreground">{c.emptyText}</p>}
        </div>
      </section>
    </Page>
  );
}
