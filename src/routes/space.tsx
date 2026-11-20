import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Page } from "@/components/site";
import { ProductRail } from "@/components/worlds";
import { CenterRail } from "@/components/center-rail";
import { inWorld, worldCategories } from "@/lib/catalog";
import { img } from "@/lib/media";
import { useSite } from "@/lib/site";
import { setWorld } from "@/lib/world";

export const Route = createFileRoute("/space")({
  head: () => ({
    meta: [
      { title: "Space — Lighting & Living Objects | Layer & Loop" },
      { name: "description", content: "Sculptural table lamps, pendants, vases, planters and desk pieces with quiet forms and warm light." },
      { property: "og:title", content: "Space by Layer & Loop" },
      { property: "og:description", content: "Calm lighting and living objects, printed to order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpacePage,
});

function SpacePage() {
  useEffect(() => setWorld("space"), []);
  const site = useSite();
  const c = site.content("space");
  const products = inWorld(site.products, "space");
  const featured = products.filter((p) => p.featured).slice(0, 6);
  const cats = worldCategories(site.categories, site.products, "space").filter((x) => x.image);
  return (
    <Page>
      <section className="relative h-[70svh] min-h-[420px] overflow-hidden bg-ink text-ink-foreground">
        <img src={img(c.image)} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-14 md:px-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{c.eyebrow}</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-extrabold uppercase leading-tight md:text-6xl">{c.title}</h1>
          <p className="mt-3 max-w-lg text-ink-foreground/80">{c.text}</p>
          <Link to="/products" search={{ world: "space" }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink-foreground px-5 py-2.5 text-sm font-semibold text-ink">Shop all Space <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
      {featured.length > 0 && <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold uppercase md:text-4xl">{c.editTitle}</h2>
          <Link to="/products" search={{ world: "space", featured: true }} className="inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2 text-sm">View featured <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ProductRail products={featured} />
      </section>}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-20">
        <h2 className="text-3xl font-extrabold uppercase md:text-4xl">{c.categoriesTitle}</h2>
        <CenterRail className="-mx-4 mt-6 md:-mx-6 md:mt-10" itemClass="w-[55%] md:w-[40%] lg:w-[30%]" edgeClass="w-[22.5%] md:w-[30%] lg:w-[35%]" start={0}>
          {cats.map((x) => (
            <Link key={x.id} to="/products" search={{ world: "space", category: x.name }} className="block">
              <img src={x.image} alt={x.name} loading="lazy" className="aspect-[3/4] w-full rounded-xl object-cover" />
              <p className="mt-3 font-display text-sm font-semibold">{x.name}</p>
            </Link>
          ))}
        </CenterRail>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <h2 className="text-center text-3xl font-bold md:text-4xl">{c.setupsTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {c.setups.map((s, n) => <img key={s + n} src={img(s)} alt={`${c.setupsTitle} ${n + 1}`} loading="lazy" className="aspect-[4/5] w-full rounded-2xl object-cover" />)}
        </div>
      </section>
    </Page>
  );
}
