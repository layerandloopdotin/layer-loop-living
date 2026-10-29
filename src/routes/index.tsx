import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Layer & Loop — 3D Printed Lifestyle Goods" },
      { name: "description", content: "Vases, planters and lamps printed layer by layer from plant-based materials." },
      { property: "og:title", content: "Layer & Loop — 3D Printed Lifestyle Goods" },
      { property: "og:description", content: "Objects for slow living, printed layer by layer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const products = [
  { name: "Ripple Vase", price: "₹1,890", tone: "bg-primary/15" },
  { name: "Cloud Planter", price: "₹1,450", tone: "bg-secondary" },
  { name: "Loop Lamp", price: "₹4,200", tone: "bg-accent/50" },
  { name: "Wave Tray", price: "₹990", tone: "bg-muted" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl font-semibold">Layer<span className="text-primary">&</span>Loop</span>
        <nav className="hidden gap-8 text-sm md:flex">
          <a href="#shop">Shop</a><a href="#process">Process</a><a href="#story">Story</a>
        </nav>
        <button className="rounded-full border border-foreground px-4 py-2 text-sm">Cart (0)</button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">3D printed lifestyle</p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-7xl">Made layer<br />by <em className="text-primary">layer.</em></h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">Sculptural objects for your home, printed on demand from plant-based materials.</p>
          <div className="mt-8 flex gap-3">
            <a href="#shop" className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Shop the collection</a>
            <a href="#process" className="rounded-full px-6 py-3 font-medium underline underline-offset-4">How it's made</a>
          </div>
        </div>
        <img src={hero} alt="Ribbed terracotta vase, wavy sage planter and looped lamp" width={1600} height={1008} className="rounded-3xl" />
      </section>

      <section id="shop" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-4xl">Bestsellers</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((p) => (
            <div key={p.name}>
              <div className={`aspect-[3/4] rounded-2xl ${p.tone}`} />
              <div className="mt-3 flex justify-between"><span className="font-medium">{p.name}</span><span className="text-muted-foreground">{p.price}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="bg-foreground py-20 text-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-3">
          {[["01", "Designed", "Shapes drawn in-house, inspired by water and motion."], ["02", "Printed", "Hundreds of fine layers in compostable PLA."], ["03", "Finished", "Hand-checked and shipped plastic-free."]].map(([n, t, d]) => (
            <div key={n}><span className="font-display text-5xl text-primary">{n}</span><h3 className="mt-4 text-2xl">{t}</h3><p className="mt-2 opacity-70">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="story" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-4xl md:text-5xl">Small batches. Zero waste. Endless loops.</h2>
        <form className="mx-auto mt-10 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Your email" className="flex-1 rounded-full border border-border bg-card px-5 py-3" />
          <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">Join</button>
        </form>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">© 2026 Layer & Loop</footer>
    </div>
  );
}
