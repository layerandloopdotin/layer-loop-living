import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Grid3x3, LayoutGrid, Square, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  validateSearch: (s: Record<string, unknown>): { category?: string; featured?: boolean } => ({
    ...(typeof s["category"] === "string" ? { category: s["category"] } : {}),
    ...(s["featured"] === true || s["featured"] === "true" ? { featured: true } : {}),
  }),
  component: Products,
});

function Products() {
  const site = useSite();
  const c = site.content("catalog");
  const { category, featured: featuredParam } = Route.useSearch();
  const [featured, setFeatured] = useState(!!featuredParam);
  useEffect(() => setFeatured(!!featuredParam), [featuredParam]);
  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  useEffect(() => setCats(category ? [category] : []), [category]);
  const [spaces, setSpaces] = useState<string[]>([]);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const shown = site.products.filter((p) => (!featured || p.featured) && (!cats.length || p.categories.some((x) => cats.includes(x))) && (!spaces.length || p.spaces.some((x) => spaces.includes(x))));

  const [cols, setCols] = useState<1 | 2 | 3>(2);
  useEffect(() => { const g = localStorage.getItem("ll-grid"); if (g === "1" || g === "3") setCols(Number(g) as 1 | 3); }, []);
  const setDensity = (v: 1 | 2 | 3) => { setCols(v); localStorage.setItem("ll-grid", String(v)); };
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = grid.current;
    if (!el || cols === 3 || !window.matchMedia("(hover: none) and (max-width: 767px)").matches) return;
    el.setAttribute("data-focus-mode", "");
    let last: Element | null = null;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || e.target === last) continue;
        last?.removeAttribute("data-focus");
        e.target.setAttribute("data-focus", "");
        last = e.target;
        navigator.vibrate?.(8);
      }
    }, { rootMargin: "-45% 0px -45% 0px" });
    el.querySelectorAll(".product-card").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [shown.length, cols, cats.join(), spaces.join(), featured]);
  const active = cats.length + spaces.length + (featured ? 1 : 0);

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
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button type="button" className="inline-flex items-center gap-2 rounded-full border border-foreground px-4 py-2 text-sm">
              <SlidersHorizontal className="h-4 w-4" /> {c.filtersTitle}{active > 0 && <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{active}</span>}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
            <SheetTitle className="font-display uppercase">{c.filtersTitle}</SheetTitle>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">{c.categoryLabel}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Box label={c.allLabel} checked={!cats.length && !featured} onChange={() => { setCats([]); setFeatured(false); }} />
              <Box label="Featured Collection" checked={featured} onChange={() => setFeatured(!featured)} />
              {site.categories.map((x) => <Box key={x.id} label={x.name} checked={cats.includes(x.name)} onChange={() => toggle(cats, setCats, x.name)} />)}
            </div>
            {site.spaces.length > 0 && <>
              <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">{c.spaceLabel}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {site.spaces.map((m) => <Box key={m.id} label={m.name} checked={spaces.includes(m.name)} onChange={() => toggle(spaces, setSpaces, m.name)} />)}
              </div>
            </>}
            <button type="button" onClick={() => { setCats([]); setSpaces([]); setFeatured(false); }} className="mt-8 w-full rounded-full border border-foreground py-3 text-sm">Clear all</button>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-1 rounded-full border p-1">
          <button type="button" aria-label="Three per row" aria-pressed={cols === 3} onClick={() => setDensity(3)} className={`rounded-full p-1.5 ${cols === 3 ? "bg-foreground text-background" : ""}`}><Grid3x3 className="h-4 w-4" /></button>
          <button type="button" aria-label="Two per row" aria-pressed={cols === 2} onClick={() => setDensity(2)} className={`rounded-full p-1.5 ${cols === 2 ? "bg-foreground text-background" : ""}`}><LayoutGrid className="h-4 w-4" /></button>
          <button type="button" aria-label="One per row" aria-pressed={cols === 1} onClick={() => setDensity(1)} className={`rounded-full p-1.5 ${cols === 1 ? "bg-foreground text-background" : ""}`}><Square className="h-4 w-4" /></button>
        </div>
      </div>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-8 md:grid-cols-[200px_1fr] md:px-6 md:py-16">
        <aside className="hidden md:sticky md:top-24 md:block md:self-start">
          <h3 className="font-display font-bold uppercase">{c.filtersTitle}</h3>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">{c.categoryLabel}</p>
          <div className="mt-3 space-y-2">
            <Box label={c.allLabel} checked={!cats.length && !featured} onChange={() => { setCats([]); setFeatured(false); }} />
            <Box label="Featured Collection" checked={featured} onChange={() => setFeatured(!featured)} />
            {site.categories.map((x) => <Box key={x.id} label={x.name} checked={cats.includes(x.name)} onChange={() => toggle(cats, setCats, x.name)} />)}
          </div>
          {site.spaces.length > 0 && <>
            <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">{c.spaceLabel}</p>
            <div className="mt-3 space-y-2">
              {site.spaces.map((m) => <Box key={m.id} label={m.name} checked={spaces.includes(m.name)} onChange={() => toggle(spaces, setSpaces, m.name)} />)}
            </div>
          </>}
        </aside>
        <div key={cats.join() + spaces.join() + featured} ref={grid} className={`product-grid grid content-start animate-in fade-in duration-500 md:grid-cols-2 md:gap-6 lg:grid-cols-3 ${cols === 3 ? "grid-cols-3 gap-x-2 gap-y-4" : cols === 2 ? "grid-cols-2 gap-x-3 gap-y-6" : "grid-cols-1 gap-8"}`}>
          {shown.map((p) => (
            <div key={p.id} className="product-card group relative">
              <Link to="/product/$slug" params={{ slug: p.slug }} aria-label={p.name} className="block">
                <div className="product-frame aspect-[4/5] overflow-hidden rounded-xl">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className={`mt-3 flex items-start justify-between gap-3 ${cols === 3 ? "max-md:hidden" : ""} ${cols === 2 ? "max-md:flex-col max-md:gap-1" : ""}`}>
                  <div className="min-w-0">
                    <p className="font-display font-semibold max-md:text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.note}</p>
                  </div>
                  <span className="shrink-0 font-display font-semibold">{formatPrice(p.price)}</span>
                </div>
              </Link>
              <WishButton slug={p.slug} name={p.name} className={`absolute right-2 top-2 z-10 md:right-3 md:top-3 ${cols === 3 ? "max-md:scale-75 max-md:right-1 max-md:top-1" : ""}`} />
            </div>
          ))}
          {!shown.length && <p className="text-muted-foreground">{c.emptyText}</p>}
        </div>
      </section>
    </Page>
  );
}
