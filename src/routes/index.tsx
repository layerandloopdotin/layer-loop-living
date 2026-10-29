import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Page, ProductCard } from "@/components/site";
import { products } from "@/lib/products";
import heroLamp from "@/assets/hero-lamp.jpg";
import living from "@/assets/living.jpg";

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
  { name: "Noir", price: 310, image: products[1].image },
  { name: "Terra", price: 280, image: products[0].image },
];
const tags = ["Sculptural", "Mid-century", "Artisan made", "Floor Lamp", "Elegant design"];

function Index() {
  const [i, setI] = useState(0);
  const s = slides[i];
  const edit = products.slice(0, 3);
  return (
    <Page>
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-16 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold uppercase leading-tight md:text-6xl">Modern designs.<br />Effortless comfort.<br />Lasting quality.</h1>
            <div className="mt-8 flex gap-3">
              {slides.map((sl, n) => (
                <button key={sl.name} onClick={() => setI(n)} className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${n === i ? "border-primary" : "border-transparent opacity-70"}`}>
                  <img src={sl.image} alt={sl.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button aria-label="Previous" onClick={() => setI((i + 2) % 3)} className="grid h-8 w-8 place-items-center rounded-full border border-ink-line"><ChevronLeft className="h-4 w-4" /></button>
              <button aria-label="Next" onClick={() => setI((i + 1) % 3)} className="grid h-8 w-8 place-items-center rounded-full border border-ink-line"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img src={s.image} alt={s.name} width={896} height={1024} className="aspect-[4/4.2] w-full object-cover" />
            <div className="absolute left-4 top-4 flex gap-2 text-xs">
              <span className="rounded-full bg-background px-3 py-1 text-foreground">Premium materials</span>
              <span className="rounded-full bg-background px-3 py-1 text-foreground">Natural finish</span>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-ink/80 px-4 py-3 text-sm backdrop-blur">
              <span><b className="font-display">{s.name}</b> <span className="ml-2 text-ink-muted">Now available for order</span></span>
              <b className="font-display">${s.price}</b>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-12">
          <p className="max-w-lg text-ink-muted">Designed with enduring materials, quiet forms, and thoughtful craftsmanship for interiors that feel timeless rather than trendy.</p>
          <div className="flex max-w-sm flex-wrap gap-2 text-xs">
            {tags.map((t, n) => <span key={t} className={`rounded-full px-3 py-1.5 ${n === 0 ? "bg-primary text-primary-foreground" : "border border-ink-line"}`}>{t}</span>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <h2 className="text-4xl font-extrabold uppercase">The Edit</h2>
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

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-xl text-4xl font-bold">Objects That Shape Everyday Living</h2>
        <img src={living} alt="Warm living room with sculptural floor lamps" loading="lazy" width={1600} height={832} className="mt-12 w-full rounded-2xl" />
      </section>
    </Page>
  );
}
