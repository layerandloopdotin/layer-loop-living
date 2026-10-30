import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Page, ProductCard } from "@/components/site";
import { InstagramStrip } from "@/components/instagram-strip";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { featuredProducts } from "@/lib/catalog";
import { img } from "@/lib/media";
import { useSite } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Layer & Loop — Modern Designs, Lasting Quality" },
      { name: "description", content: "Sculptural, atmospheric lighting and objects crafted for interiors that feel timeless." },
      { property: "og:title", content: "Layer & Loop — Modern Designs, Lasting Quality" },
      { property: "og:description", content: "Sculptural lighting and objects for everyday living." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const site = useSite();
  const c = site.content("home");
  const slides = c.heroSlides.map((x) => site.bySlug(x.product)).filter((p) => p !== undefined);
  const [i, setI] = useState(0);
  const s = slides[i] ?? slides[0];
  const edit = featuredProducts(site.products).slice(0, 3);
  return (
    <Page>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-10 md:grid-cols-[1.35fr_1fr] md:gap-12 md:px-12 md:pt-14">
          <div className="flex flex-col justify-center">
            <h1 className="whitespace-pre-line font-display text-3xl font-extrabold uppercase leading-[1.12] sm:text-4xl lg:text-5xl xl:text-6xl">{c.heroTitle}</h1>
            {slides.length > 1 && <>
              <div className="mt-9 flex gap-3">
                {slides.map((sl, n) => (
                  <Button variant="ghost" key={sl.slug} aria-label={`Show ${sl.name}`} aria-pressed={n === i} onClick={() => setI(n)} className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 p-0 ${n === i ? "border-primary" : "border-transparent opacity-70"}`}>
                    <img src={sl.image} alt={sl.name} className="h-full w-full object-cover" />
                  </Button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => setI((i + slides.length - 1) % slides.length)} className="h-7 w-7 rounded-full border border-ink-line"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Next" onClick={() => setI((i + 1) % slides.length)} className="h-7 w-7 rounded-full border border-ink-line"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </>}
          </div>
          {s && (
            <Link to="/product/$slug" params={{ slug: s.slug }} aria-label={`View ${s.name}`} className="group relative block overflow-hidden rounded-2xl">
              <img src={s.image} alt={s.name} width={896} height={1024} className="aspect-[9/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2 text-[10px] font-medium lg:text-xs">
                {c.badge1 && <span className="rounded-full bg-background px-3 py-1.5 text-foreground">{c.badge1}</span>}
                {c.badge2 && <span className="rounded-full bg-background px-3 py-1.5 text-foreground">{c.badge2}</span>}
              </div>
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-ink/80 px-4 py-3 text-sm backdrop-blur">
                <span className="min-w-0"><b className="font-display">{s.name}</b> <span className="mt-0.5 block text-xs text-ink-muted xl:ml-2 xl:inline">{c.slideCaption}</span></span>
                <b className="ml-3 shrink-0 font-display text-primary">{formatPrice(s.price)}</b>
              </div>
            </Link>
          )}
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-12 md:py-12">
          <p className="max-w-xl leading-relaxed text-ink-muted">{c.heroText}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold uppercase">{c.editTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.editSubtitle}</p>
          </div>
          <div className="max-w-sm">
            <p className="text-xs font-bold uppercase tracking-widest">{c.philosophyTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{c.philosophyText}</p>
          </div>
          <Link to="/products" search={{ featured: true }} className="inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2 text-sm">{c.editButton} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {edit.map((p) => <ProductCard key={p.slug} slug={p.slug} name={p.name} note={p.note} price={p.price} image={p.image} />)}
        </div>
      </section>

      <div className="overflow-hidden bg-ink py-4 text-ink-foreground">
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-xl font-semibold uppercase">
          {Array.from({ length: 12 }).map((_, n) => <span key={n} className="px-4">{c.marquee}</span>)}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold uppercase">{c.categoryTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.categorySubtitle}</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2 text-sm">{c.categoryButton} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:gap-5">
          {site.categories.filter((x) => x.image).map((x) => (
            <Link key={x.id} to="/products" search={{ category: x.name }} className="group block w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto md:min-w-[10rem] md:flex-1 md:shrink">

              <div className="overflow-hidden rounded-xl">
                <img src={x.image} alt={x.name} loading="lazy" width={960} height={1280} className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-display font-semibold">{x.name}</p>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-xl text-4xl font-bold">{c.livingTitle}</h2>
        {c.livingImage && <img src={img(c.livingImage)} alt={c.livingTitle} loading="lazy" width={1600} height={832} className="mt-12 w-full rounded-2xl" />}
      </section>
      <InstagramStrip />
    </Page>
  );
}
