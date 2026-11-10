import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StoreWheel } from "@/components/store-wheel";
import { DarkHero, Page } from "@/components/site";
import { InstagramStrip } from "@/components/instagram-strip";
import { CenterRail } from "@/components/center-rail";
import { useContent } from "@/lib/site";
import { img } from "@/lib/media";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Layer & Loop" },
      { name: "description", content: "Layer & Loop designs and 3D prints lamps, vases and objects in PLA, PETG, TPU, ABS and ASA — visit our studio store." },
      { property: "og:title", content: "Our Story — Layer & Loop" },
      { property: "og:description", content: "A 3D printed lifestyle brand, made layer by layer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  const rail = useRef<HTMLDivElement>(null);
  const c = useContent("about");
  const slide = (d: number) => rail.current?.scrollBy({ left: d * rail.current.clientWidth / 3, behavior: "smooth" });
  return (
    <Page>
      <DarkHero eyebrow={c.heroEyebrow} title={c.heroTitle} />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">{c.storyTitle}</h2>
          <p className="mt-5 whitespace-pre-line text-muted-foreground">{c.storyText1}</p>
          <p className="mt-4 whitespace-pre-line text-muted-foreground">{c.storyText2}</p>
        </div>
        <img src={img(c.storyImage)} alt={c.storyTitle} loading="lazy" width={1024} height={768} className="rounded-2xl" />
      </section>
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold">{c.materialsTitle}</h2>
            <div className="hidden gap-2 md:flex">
              <button aria-label="Previous material" onClick={() => slide(-1)} className="rounded-full border border-ink-muted p-2 transition-colors hover:bg-ink-soft"><ChevronLeft className="h-4 w-4" /></button>
              <button aria-label="Next material" onClick={() => slide(1)} className="rounded-full border border-ink-muted p-2 transition-colors hover:bg-ink-soft"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <CenterRail dark className="-mx-6 mt-8 md:hidden" itemClass="w-[75%]">
            {c.materials.map((m) => (
              <div key={m.name} className="rounded-2xl bg-ink-soft p-5">
                <img src={img(m.image)} alt={m.name} loading="lazy" className="aspect-[3/1.2] w-full rounded-lg object-cover" />
                <h3 className="mt-5 font-bold">{m.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{m.text}</p>
              </div>
            ))}
          </CenterRail>
          <div ref={rail} className="mt-12 hidden md:flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none]">
            {c.materials.map((m) => (
              <div key={m.name} className="shrink-0 basis-[85%] snap-start rounded-2xl bg-ink-soft p-5 sm:basis-[calc((100%-1.5rem)/2)] md:basis-[calc((100%-3rem)/3)]">
                <img src={img(m.image)} alt={m.name} loading="lazy" className="aspect-[3/1.2] w-full rounded-lg object-cover" />
                <h3 className="mt-5 font-bold">{m.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <h2 className="text-center text-3xl font-bold">{c.beliefsTitle}</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {c.beliefs.map((b) => (
            <div key={b.name} className="border-t border-border pt-6">
              <h3 className="font-bold">{b.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold uppercase">{c.atmosphereTitle}</h2>
        <img src={img(c.atmosphereImage)} alt={c.atmosphereTitle} loading="lazy" width={1600} height={768} className="mt-10 w-full rounded-2xl" />
      </section>
      <InstagramStrip />
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-20 md:pt-24">
        <div className="grid w-full items-center gap-10 md:grid-cols-[1fr_1.8fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{c.storeEyebrow}</p>
            <h2 className="mt-3 text-4xl font-bold">{c.storeTitle}</h2>
            <p className="mt-5 whitespace-pre-line text-muted-foreground">{c.storeText}</p>
            <p className="mt-6 text-sm font-semibold">{c.storeAddress}</p>
            <p className="text-sm text-muted-foreground">{c.storeHours}</p>
          </div>
          {c.storeImages.length > 0 && <StoreWheel images={c.storeImages.map(img)} alt={c.storeTitle} />}
        </div>
      </section>
    </Page>
  );
}
