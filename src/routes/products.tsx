import {
  asWorld,
  filterCatalogProducts,
  inWorld,
  lightingCover,
  lightingFilterActive,
  searchProducts,
  worldCategories,
  type World,
} from "@/lib/catalog";
import { setWorld, useWorld } from "@/lib/world";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Grid3x3, LayoutGrid, Lightbulb, LightbulbOff, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DarkHero, Page, WishButton } from "@/components/site";
import { formatPrice } from "@/lib/currency";
import { useSite } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Objects — Space & Culture | Layer & Loop" },
      {
        name: "description",
        content:
          "Shop Space lighting and living objects, or Culture collectibles and quirky desk pieces.",
      },
      { property: "og:title", content: "All Objects — Layer & Loop" },
      {
        property: "og:description",
        content: "The full Layer & Loop catalogue across Space and Culture.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    category?: string;
    setup?: string;
    featured?: boolean;
    drops?: boolean;
    q?: string;
    world?: World;
  } => ({
    ...(s["world"] === "space" || s["world"] === "culture" ? { world: asWorld(s["world"]) } : {}),
    ...(typeof s["category"] === "string" ? { category: s["category"] } : {}),
    ...(typeof s["setup"] === "string" ? { setup: s["setup"] } : {}),
    ...(typeof s["q"] === "string" && s["q"].trim() ? { q: s["q"].trim() } : {}),
    ...(s["featured"] === true || s["featured"] === "true" ? { featured: true } : {}),
    ...(s["drops"] === true || s["drops"] === "true" ? { drops: true } : {}),
  }),
  component: Products,
});

function Products() {
  const site = useSite();
  const {
    category,
    setup,
    featured: featuredParam,
    drops: dropsParam,
    q,
    world: worldParam,
  } = Route.useSearch();
  const stored = useWorld();
  useEffect(() => {
    if (worldParam) setWorld(worldParam);
  }, [worldParam]);
  const world = worldParam ?? stored;
  const searchContent = site.content("catalog");
  const spaceContent = site.content("catalogSpace");
  const cultureContent = site.content("catalogCulture");
  const worldContent = world === "culture" ? cultureContent : spaceContent;
  const c = q ? searchContent : worldContent;
  const homeContent = site.content("home");
  const worldCats = q ? site.categories : worldCategories(site.categories, site.products, world);
  const [featured, setFeatured] = useState(!!featuredParam);
  useEffect(() => setFeatured(!!featuredParam), [featuredParam]);
  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  useEffect(() => setCats(category ? [category] : []), [category, world]);
  const [spaces, setSpaces] = useState<string[]>([]);
  const [cultureSetups, setCultureSetups] = useState<string[]>(setup ? [setup] : []);
  const [dropsOnly, setDropsOnly] = useState(!!dropsParam);
  useEffect(() => {
    setSpaces([]);
    setCultureSetups(world === "culture" && setup ? [setup] : []);
    setDropsOnly(world === "culture" && !!dropsParam);
  }, [world, setup, dropsParam]);
  const [lightsOn, setLightsOn] = useState(false);
  const lightingOnly = world === "space" && lightingFilterActive(cats);
  useEffect(() => {
    if (!lightingOnly) setLightsOn(false);
  }, [lightingOnly]);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const pool = q ? searchProducts(site.products, q) : inWorld(site.products, world);
  const shown = filterCatalogProducts(pool, {
    featured,
    categories: cats,
    spaces: !q && world === "space" ? spaces : [],
    cultureSetups: !q && world === "culture" ? cultureSetups : [],
    dropsOnly: !q && world === "culture" ? dropsOnly : false,
    cultureFilters: site.cultureFilters,
  });

  const [cols, setCols] = useState<2 | 3>(2);
  useEffect(() => {
    const g = localStorage.getItem("ll-grid");
    if (g === "3") setCols(3);
    else if (g === "1") setCols(2);
  }, []);
  const setDensity = (v: 2 | 3) => {
    setCols(v);
    localStorage.setItem("ll-grid", String(v));
  };
  const grid = useRef<HTMLDivElement>(null);
  const catsKey = cats.join();
  const spacesKey = spaces.join();
  const setupsKey = cultureSetups.join();
  useEffect(() => {
    const el = grid.current;
    if (!el || cols === 3 || !window.matchMedia("(hover: none) and (max-width: 767px)").matches)
      return;
    el.setAttribute("data-focus-mode", "");
    let last: Element | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.target === last) continue;
          last?.removeAttribute("data-focus");
          e.target.setAttribute("data-focus", "");
          last = e.target;
          navigator.vibrate?.(8);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    el.querySelectorAll(".product-card").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [shown.length, cols, catsKey, spacesKey, setupsKey, dropsOnly, featured]);
  const active =
    cats.length +
    (world === "space" ? spaces.length : cultureSetups.length + (dropsOnly ? 1 : 0)) +
    (featured ? 1 : 0);

  const clearAll = () => {
    setCats([]);
    setSpaces([]);
    setCultureSetups([]);
    setDropsOnly(false);
    setFeatured(false);
  };

  const Box = ({
    checked,
    label,
    onChange,
  }: {
    checked: boolean;
    label: string;
    onChange: () => void;
  }) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-foreground" />{" "}
      {label}
    </label>
  );

  const renderWorldSecondaryFilter = (mobile: boolean) => {
    if (q) return null;
    if (world === "space" && site.spaces.length > 0) {
      return (
        <>
          <p
            className={`${mobile ? "mt-6" : "mt-8"} text-xs uppercase tracking-widest text-muted-foreground`}
          >
            {spaceContent.spaceLabel}
          </p>
          <div className={mobile ? "mt-3 grid grid-cols-2 gap-3" : "mt-3 space-y-2"}>
            {site.spaces.map((m) => (
              <Box
                key={m.id}
                label={m.name}
                checked={spaces.includes(m.name)}
                onChange={() => toggle(spaces, setSpaces, m.name)}
              />
            ))}
          </div>
        </>
      );
    }
    if (world === "culture") {
      return (
        <>
          <p
            className={`${mobile ? "mt-6" : "mt-8"} text-xs uppercase tracking-widest text-muted-foreground`}
          >
            {cultureContent.collectionLabel}
          </p>
          <div className={mobile ? "mt-3 grid grid-cols-2 gap-3" : "mt-3 space-y-2"}>
            <Box
              label={cultureContent.dropsOnlyLabel || "Limited Drops only"}
              checked={dropsOnly}
              onChange={() => setDropsOnly(!dropsOnly)}
            />
            {site.cultureFilters.map((f) => (
              <Box
                key={f.id}
                label={f.name}
                checked={cultureSetups.includes(f.name)}
                onChange={() => toggle(cultureSetups, setCultureSetups, f.name)}
              />
            ))}
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <Page>
      <DarkHero title={c.heroTitle}>
        <p className="mt-4 max-w-md text-ink-muted">{c.heroText}</p>
        {!q && (
          <div
            role="tablist"
            aria-label="World"
            className="mt-6 inline-flex rounded-full border border-ink-line p-1"
          >
            {(["space", "culture"] as const).map((w) => (
              <Link
                key={w}
                role="tab"
                aria-selected={world === w}
                to="/products"
                search={{ world: w }}
                className={`rounded-full px-5 py-2 font-display text-sm font-semibold uppercase tracking-widest transition-colors ${world === w ? (w === "culture" ? "bg-pop-blue text-pop-blue-foreground" : "bg-ink-foreground text-ink") : "text-ink-muted"}`}
              >
                {w === "culture" ? homeContent.cultureLabel : homeContent.spaceLabel}
              </Link>
            ))}
          </div>
        )}
        {q && (
          <p className="mt-4 text-sm">
            Showing results for “{q}” ·{" "}
            <Link to="/products" className="underline">
              Clear
            </Link>
          </p>
        )}
      </DarkHero>
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-auto md:max-w-7xl md:justify-end md:border-b-0 md:px-6 md:pt-8">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-foreground px-4 py-2 text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" /> {c.filtersTitle}
                {active > 0 && (
                  <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">
                    {active}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
              <SheetTitle className="font-display uppercase">{c.filtersTitle}</SheetTitle>
              <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
                {c.categoryLabel}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Box
                  label={c.allLabel}
                  checked={!cats.length && !featured}
                  onChange={() => {
                    setCats([]);
                    setFeatured(false);
                  }}
                />
                <Box
                  label={c.featuredLabel || "Featured Collection"}
                  checked={featured}
                  onChange={() => setFeatured(!featured)}
                />
                {worldCats.map((x) => (
                  <Box
                    key={x.id}
                    label={x.name}
                    checked={cats.includes(x.name)}
                    onChange={() => toggle(cats, setCats, x.name)}
                  />
                ))}
              </div>
              {renderWorldSecondaryFilter(true)}
              <button
                type="button"
                onClick={clearAll}
                className="mt-8 w-full rounded-full border border-foreground py-3 text-sm"
              >
                Clear all
              </button>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-3">
          {lightingOnly && (
            <button
              type="button"
              role="switch"
              aria-checked={lightsOn}
              aria-label="Lights"
              title={lightsOn ? "Switch lights off" : "Switch lights on"}
              onClick={() => {
                const next = !lightsOn;
                setLightsOn(next);
                navigator.vibrate?.(next ? 14 : 8);
              }}
              className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors duration-300 ${lightsOn ? "border-primary/60 bg-primary/20" : "border-foreground/25 bg-muted"}`}
            >
              <span
                className={`absolute left-[3px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full shadow-sm transition-[translate,background-color,color] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${lightsOn ? "translate-x-[24px] bg-primary text-primary-foreground" : "translate-x-0 bg-background text-muted-foreground"}`}
              >
                {lightsOn ? (
                  <Lightbulb className="h-3.5 w-3.5" />
                ) : (
                  <LightbulbOff className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
          )}
          <div className="flex items-center gap-1 rounded-full border p-0.5">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label="Three per row"
              title="Three per row"
              aria-pressed={cols === 3}
              onClick={() => setDensity(3)}
              className={`h-7 w-7 rounded-full ${cols === 3 ? "bg-foreground text-background" : ""}`}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label="Two per row"
              title="Two per row"
              aria-pressed={cols === 2}
              onClick={() => setDensity(2)}
              className={`h-7 w-7 rounded-full ${cols === 2 ? "bg-foreground text-background" : ""}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8 md:px-6 md:pb-16">
        <aside className="hidden md:sticky md:top-24 md:block md:self-start">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-bold uppercase">{c.filtersTitle}</h3>
            {active > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
            {c.categoryLabel}
          </p>
          <div className="mt-3 space-y-2">
            <Box
              label={c.allLabel}
              checked={!cats.length && !featured}
              onChange={() => {
                setCats([]);
                setFeatured(false);
              }}
            />
            <Box
              label={c.featuredLabel || "Featured Collection"}
              checked={featured}
              onChange={() => setFeatured(!featured)}
            />
            {worldCats.map((x) => (
              <Box
                key={x.id}
                label={x.name}
                checked={cats.includes(x.name)}
                onChange={() => toggle(cats, setCats, x.name)}
              />
            ))}
          </div>
          {renderWorldSecondaryFilter(false)}
        </aside>
        <div
          key={
            world + cats.join() + spaces.join() + cultureSetups.join() + dropsOnly + featured + cols
          }
          ref={grid}
          data-density={cols}
          className={`product-grid grid min-w-0 content-start animate-in fade-in duration-500 ${cols === 3 ? "grid-cols-3 gap-x-2 gap-y-4 md:gap-5" : "grid-cols-2 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10"}`}
        >
          {shown.map((p) => (
            <div key={p.id} className="product-card group relative">
              <Link
                to="/product/$slug"
                params={{ slug: p.slug }}
                aria-label={p.name}
                className="block"
              >
                <div className="product-frame aspect-[4/5] overflow-hidden rounded-xl">
                  <img
                    src={lightingCover(p, lightingOnly && lightsOn)}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className={`flex items-start justify-between gap-3 ${cols === 3 ? "max-md:hidden md:flex-col md:gap-1 lg:flex-row lg:flex-wrap" : ""} ${cols === 2 ? "mt-5 max-lg:flex-col max-lg:gap-1" : "mt-4"}`}
                >
                  <div className="min-w-0">
                    <p className="font-display font-semibold max-md:text-sm">
                      {p.name}
                      {q && (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-bold uppercase ${p.world === "culture" ? "bg-pop-orange text-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          {p.world}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.note}</p>
                  </div>
                  <span className="shrink-0 font-display font-semibold">
                    {formatPrice(p.price)}
                  </span>
                </div>
              </Link>
              <WishButton
                slug={p.slug}
                name={p.name}
                className={`absolute right-2 top-2 z-10 md:right-3 md:top-3 ${cols === 3 ? "max-md:scale-75 max-md:right-1 max-md:top-1" : ""}`}
              />
            </div>
          ))}
          {!shown.length && <p className="text-muted-foreground">{c.emptyText}</p>}
        </div>
      </section>
    </Page>
  );
}
