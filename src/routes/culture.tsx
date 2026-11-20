import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Page } from "@/components/site";
import { ProductRail } from "@/components/worlds";
import { inWorld, worldCategories } from "@/lib/catalog";
import { img } from "@/lib/media";
import { useSite } from "@/lib/site";
import { setWorld } from "@/lib/world";

export const Route = createFileRoute("/culture")({
  head: () => ({
    meta: [
      { title: "Culture — Collectibles & Quirky Desk Pieces | Layer & Loop" },
      { name: "description", content: "Pop collectibles, figurines, quirky desk organisers and statement pieces, 3D printed in our studio." },
      { property: "og:title", content: "Culture by Layer & Loop" },
      { property: "og:description", content: "Loud little objects for your desk and shelf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CulturePage,
});

function CulturePage() {
  useEffect(() => setWorld("culture"), []);
  const site = useSite();
  const c = site.content("culture");
  const products = inWorld(site.products, "culture");
  const drops = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products).slice(0, 8);
  const cats = worldCategories(site.categories, site.products, "culture");
  return (
    <Page>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 md:grid-cols-2 md:px-12 md:py-16">
          <div>
            <p className="inline-block -rotate-2 rounded-md bg-pop-orange px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-foreground">{c.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[1.02] md:text-6xl">{c.title}</h1>
            <p className="mt-4 max-w-md text-ink-foreground/80">{c.text}</p>
            <Link to="/products" search={{ world: "culture" }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-pop-blue px-5 py-2.5 text-sm font-semibold text-pop-blue-foreground">Shop all Culture <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative">
            <img src={img(c.image)} alt={c.title} className="aspect-[4/3] w-full rotate-1 rounded-3xl border-4 border-pop-blue object-cover" />
            <span className="absolute -bottom-3 -left-3 rotate-[-6deg] rounded-full bg-pop-orange px-4 py-2 font-display text-sm font-extrabold uppercase text-foreground">{c.dropsTag}</span>
          </div>
        </div>
        <div className="overflow-hidden bg-pop-blue py-3 text-pop-blue-foreground">
          <div className="flex w-max animate-marquee whitespace-nowrap font-display text-lg font-extrabold uppercase">
            {Array.from({ length: 10 }).map((_, n) => <span key={n} className="px-4">{c.ticker}</span>)}
          </div>
        </div>
      </section>
      {drops.length > 0 && <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold uppercase md:text-4xl">{c.dropsTitle}</h2>
          <Link to="/products" search={{ world: "culture" }} className="inline-flex items-center gap-2 rounded-full border-2 border-pop-blue px-5 py-2 text-sm font-semibold">See everything <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ProductRail products={drops} tag={c.dropsTag} />
      </section>}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-20">
        <h2 className="text-3xl font-extrabold uppercase md:text-4xl">{c.categoriesTitle}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {cats.map((x, n) => (
            <Link key={x.id} to="/products" search={{ world: "culture", category: x.name }}
              className={`rounded-full border-2 px-5 py-2.5 font-display text-sm font-bold uppercase transition-transform hover:-rotate-2 ${n % 2 ? "border-pop-orange" : "border-pop-blue"}`}>{x.name}</Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <h2 className="text-center text-3xl font-bold md:text-4xl">{c.setupsTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {c.setups.map((s, n) => <img key={s + n} src={img(s)} alt={`${c.setupsTitle} ${n + 1}`} loading="lazy" className={`aspect-[4/5] w-full rounded-2xl object-cover ${n % 2 ? "md:translate-y-6" : ""}`} />)}
        </div>
      </section>
    </Page>
  );
}
