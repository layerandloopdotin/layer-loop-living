import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Logo({ dot = false }: { dot?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      {dot && <span className="h-4 w-4 rounded-full bg-primary" />}
      <span className="font-display text-lg font-bold tracking-tight">b LAYER &amp; LOOP</span>
    </Link>
  );
}

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/trade", label: "Trade" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-ink-line bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden gap-7 text-sm md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
                className="pb-1 text-ink-muted transition-colors hover:text-ink-foreground"
                activeProps={{ className: "border-b-2 border-ink-foreground !text-ink-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link to="/trade" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          Contact us <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

const cols = [
  ["Explore", ["Collection", "Floor Lamps", "Table Lamps", "Pendant Lamps"]],
  ["Company", ["Our Story", "Materials", "Trade Pricing", "Contact"]],
  ["Social", ["Instagram", "Pinterest", "Journal", "Youtube"]],
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo dot />
          <p className="mt-4 max-w-xs text-sm text-ink-muted">Thoughtfully crafted atmospheric lighting balancing sculpture, form, and comfort. Bring a warm, organic glow to everyday interiors.</p>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <h4 className="text-xs font-bold uppercase tracking-widest">{h}</h4>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">{items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl justify-between border-t border-ink-line px-6 py-6 text-xs text-ink-muted">
        <span>© 2026 LAYER &amp; LOOP Objects. Crafted for lasting atmosphere.</span>
        <span className="flex gap-6"><span>Privacy Policy</span><span>Terms &amp; Services</span></span>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

export function ProductCard({ name, note, price, image, tall }: { name: string; note?: string; price?: number; image: string; tall?: boolean }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="group">
      <div className={`relative overflow-hidden rounded-xl ${tall ? "aspect-[4/5]" : "aspect-square"}`}>
        <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <button aria-label="Save" onClick={() => setLiked(!liked)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background">
          <Heart className={`h-4 w-4 ${liked ? "fill-foreground" : ""}`} />
        </button>
      </div>
      {note !== undefined && (
        <div className="mt-3 flex justify-between">
          <div><p className="font-display font-semibold">{name}</p><p className="text-xs text-muted-foreground">{note}</p></div>
          {price && <span className="font-display font-semibold">${price}</span>}
        </div>
      )}
    </div>
  );
}

export function DarkHero({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-6xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
