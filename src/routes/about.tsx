import { createFileRoute, Link } from "@tanstack/react-router";
import { DarkHero, Page } from "@/components/site";
import craft from "@/assets/about-printer.jpg";
import pla from "@/assets/mat-pla.jpg";
import petg from "@/assets/mat-petg.jpg";
import tpu from "@/assets/mat-tpu.jpg";
import store1 from "@/assets/store-1.jpg";
import store2 from "@/assets/store-2.jpg";
import store3 from "@/assets/store-3.jpg";
import study from "@/assets/study.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Layer & Loop" },
      { name: "description", content: "Layer & Loop designs and 3D prints lamps, vases and objects in PLA, PETG and TPU — visit our studio store." },
      { property: "og:title", content: "Our Story — Layer & Loop" },
      { property: "og:description", content: "A 3D printed lifestyle brand, made layer by layer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const mats = [
  { name: "PLA", text: "Plant-based, matte and non-toxic. Our go-to for lamps, vases and collectibles.", img: pla },
  { name: "PETG", text: "Tough and water-safe, so planters and everyday objects last.", img: petg },
  { name: "TPU", text: "Soft and flexible, used for grips, feet and desk essentials.", img: tpu },
];

const beliefs = [
  { name: "Made to Order", text: "Every piece is printed when you order it — no overstock, little waste." },
  { name: "Designed In-House", text: "Each form is modelled by our own team, then refined print by print." },
  { name: "Kind Materials", text: "Non-toxic filaments, chosen to be safe at home and recyclable where possible." },
];

function About() {
  return (
    <Page>
      <DarkHero eyebrow="Our Story" title="Layer. Loop. Form." />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">We believe objects should be designed, not just manufactured.</h2>
          <p className="mt-5 text-muted-foreground">LAYER &amp; LOOP started in 2022 as a small print studio with a handful of machines and a simple idea: that 3D printing could make calm, sculptural objects for everyday living.</p>
          <p className="mt-4 text-muted-foreground">Every lamp, vase and desk piece is designed in-house and printed to order, layer by layer. The fine lines you see are not hidden — they are the signature of how each object was made.</p>
        </div>
        <img src={craft} alt="3D printer printing a lamp shade" loading="lazy" width={1024} height={768} className="rounded-2xl" />
      </section>
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold">Materials We Print With</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {mats.map((m) => (
              <div key={m.name} className="rounded-2xl bg-ink-soft p-5">
                <img src={m.img} alt={m.name} loading="lazy" className="aspect-[3/1.2] w-full rounded-lg object-cover" />
                <h3 className="mt-5 font-bold">{m.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pt-20">
        <h2 className="text-center text-3xl font-bold">What We Believe</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {beliefs.map((b) => (
            <div key={b.name} className="border-t border-border pt-6">
              <h3 className="font-bold">{b.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold uppercase">Designed for Atmosphere</h2>
        <img src={study} alt="Warm study lit at dusk" loading="lazy" width={1600} height={768} className="mt-10 w-full rounded-2xl" />
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Visit Us</p>
            <h2 className="mt-3 text-3xl font-bold">Our Retail Store</h2>
            <p className="mt-5 text-muted-foreground">Printed objects are best understood in person. We opened our store so you can run a hand over the layer lines, see the lamps glowing as they would at home, and watch a printer at work in the window.</p>
            <p className="mt-6 text-sm font-semibold">12 Linking Road, Bandra West, Mumbai</p>
            <p className="text-sm text-muted-foreground">Tue – Sun, 11am – 8pm</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[store1, store2, store3].map((src, i) => (
              <img key={i} src={src} alt="Layer & Loop retail store" loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full rounded-2xl object-cover" />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">For Studios, Cafés &amp; Retailers</h2>
            <p className="mt-3 max-w-xl text-ink-muted">We take B2B, bulk and custom print orders for interiors, hospitality and retail. Tell us what you need.</p>
          </div>
          <Link to="/trade" className="rounded-full border border-ink-foreground px-7 py-3 text-sm font-semibold transition-colors hover:bg-ink-foreground hover:text-ink">Trade Enquiries</Link>
        </div>
      </section>
    </Page>
  );
}
