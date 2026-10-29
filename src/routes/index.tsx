import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Page, ProductCard } from "@/components/site";
import { InstagramStrip } from "@/components/instagram-strip";
import { categoryTiles, products } from "@/lib/products";
import heroLamp from "@/assets/hero-lamp.jpg";
import living from "@/assets/living.jpg";
import noir from "@/assets/noir.jpg";
import terra from "@/assets/terra.jpg";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";

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

const slides = [
  { name: "The Stack Lamp", price: 340, image: heroLamp },
  { name: "Noir", price: 310, image: noir },
  { name: "Terra", price: 280, image: terra },
];
const tags = ["Nature", "Sculptural", "Minimalism"];

function Index() {
  const [i, setI] = useState(0);
  const s = slides[i] ?? slides[0];
  const edit = products.slice(0, 3);
  if (!s) return null;
  return (
    <Page>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-10 md:grid-cols-[1.35fr_1fr] md:gap-12 md:px-12 md:pt-14">
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-3xl font-extrabold uppercase leading-[1.12] sm:text-4xl lg:text-5xl xl:text-6xl">Modern designs.<br />Effortless comfort.<br />Lasting quality.</h1>
            <div className="mt-9 flex gap-3">
              {slides.map((sl, n) => (
                <Button variant="ghost" key={sl.name} aria-label={`Show ${sl.name}`} aria-pressed={n === i} onClick={() => setI(n)} className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 p-0 ${n === i ? "border-primary" : "border-transparent opacity-70"}`}>
                  <img src={sl.image} alt={sl.name} className="h-full w-full object-cover" />
                </Button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => setI((i + slides.length - 1) % slides.length)} className="h-7 w-7 rounded-full border border-ink-line"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Next" onClick={() => setI((i + 1) % slides.length)} className="h-7 w-7 rounded-full border border-ink-line"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img src={s.image} alt={s.name} width={896} height={1024} className="aspect-[9/10] w-full object-cover" />
            <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2 text-[10px] font-medium lg:text-xs">
              <span className="rounded-full bg-background px-3 py-1.5 text-foreground">Premium selection</span>
              <span className="rounded-full bg-background px-3 py-1.5 text-foreground">Non - Toxic Material</span>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-ink/80 px-4 py-3 text-sm backdrop-blur">
              <span className="min-w-0"><b className="font-display">{s.name}</b> <span className="mt-0.5 block text-xs text-ink-muted xl:ml-2 xl:inline">Now available for order</span></span>
              <b className="ml-3 shrink-0 font-display text-primary">{formatPrice(s.price)}</b>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-12 md:py-12">
          <p className="max-w-xl leading-relaxed text-ink-muted">Designed with enduring materials, quiet forms, and thoughtful craftsmanship for interiors that feel timeless rather than trendy.</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.map((t, n) => <span key={t} className={`rounded-full px-3 py-1.5 ${n === 0 ? "bg-primary text-primary-foreground" : "border border-ink-line"}`}>{t}</span>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold uppercase">The Edit</h2>
            <p className="mt-2 text-sm text-muted-foreground">Feature collection</p>
          </div>
          <div className="max-w-sm">
            <p className="text-xs font-bold uppercase tracking-widest">Our Philosophy</p>
            <p className="mt-2 text-sm text-muted-foreground">Every piece is thoughtfully crafted to balance atmosphere, material, and form — bringing quiet elegance into everyday living.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2 text-sm">Enter Collection <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {edit.map((p) => <ProductCard key={p.name} {...p} />)}
        </div>
      </section>

      <div className="overflow-hidden bg-ink py-4 text-ink-foreground">
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-xl font-semibold uppercase">
          {Array.from({ length: 12 }).map((_, n) => <span key={n} className="px-4">Designed to be lived with ✦</span>)}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold uppercase">Shop by Category</h2>
            <p className="mt-2 text-sm text-muted-foreground">Find the piece that fits your space</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2 text-sm">Browse All Collections <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {categoryTiles.map((c) => (
            <Link key={c.name} to="/products" search={{ category: c.name }} className="group block">
              <div className="overflow-hidden rounded-xl">
                <img src={c.image} alt={c.name} loading="lazy" width={960} height={1280} className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-display font-semibold">{c.name}</p>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-xl text-4xl font-bold">Objects That Shape Everyday Living</h2>
        <img src={living} alt="Warm living room with sculptural floor lamps" loading="lazy" width={1600} height={832} className="mt-12 w-full rounded-2xl" />
      </section>
      <InstagramStrip />
    </Page>
  );
}
