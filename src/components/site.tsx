import { Link } from "@tanstack/react-router";
import { ArrowRight, Laugh, MessageCircle, ShoppingBag, Smile } from "lucide-react";
import { type ReactNode } from "react";
import { formatPrice } from "@/lib/currency";
import { shop, useShop } from "@/lib/shop";
import { useSite, waHref } from "@/lib/site";

/** Wishlist toggle — a smile that turns into a laugh when saved. */
export function WishButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const { wishlist } = useShop();
  const on = wishlist.includes(slug);
  const Icon = on ? Laugh : Smile;
  return (
    <button type="button" aria-label={on ? `Remove ${name} from favourites` : `Add ${name} to favourites`} aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); shop.toggleWish(slug); }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground transition-transform hover:scale-110 ${className}`}>
      <Icon className={`h-5 w-5 ${on ? "text-primary" : ""}`} strokeWidth={on ? 2.25 : 1.75} />
    </button>
  );
}

export function Logo({ dot = false }: { dot?: boolean }) {
  const s = useSite().content("settings");
  return (
    <Link to="/" className="flex items-center gap-2">
      {dot && <span className="h-4 w-4 rounded-full bg-primary" />}
      <span className="font-display text-lg font-bold tracking-tight">{s.brand}</span>
    </Link>
  );
}

function HeaderIcon({ to, label, count, children }: { to: "/cart" | "/wishlist"; label: string; count: number; children: ReactNode }) {
  return (
    <Link to={to} aria-label={`${label}${count ? ` (${count})` : ""}`} className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-ink-foreground transition-colors hover:border-ink-foreground">
      {children}
      {count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{count}</span>}
    </Link>
  );
}

export function SiteHeader() {
  const { cart, wishlist } = useShop();
  const s = useSite().content("settings");
  return (
    <header className="border-b border-ink-line bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden gap-7 text-sm md:flex">
            {s.nav.map((n) => (
              <Link key={n.label + n.path} to={n.path as "/"} activeOptions={{ exact: true }}
                className="pb-1 text-ink-muted transition-colors hover:text-ink-foreground"
                activeProps={{ className: "border-b-2 border-ink-foreground !text-ink-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/contactus" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            {s.contactButton} <ArrowRight className="h-4 w-4" />
          </Link>
          <HeaderIcon to="/wishlist" label="Favourites" count={wishlist.length}><Smile className="h-4 w-4" /></HeaderIcon>
          <HeaderIcon to="/cart" label="Cart" count={cart.reduce((sum, c) => sum + c.qty, 0)}><ShoppingBag className="h-4 w-4" /></HeaderIcon>
        </div>
      </div>
    </header>
  );
}

const footLink = "transition-colors hover:text-ink-foreground";
const footHead = "text-xs font-bold uppercase tracking-widest";

export function SiteFooter() {
  const site = useSite();
  const s = site.content("settings");
  const all = site.content("catalog").allLabel;
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo dot />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">{s.footerText}</p>
        </div>
        <div>
          <h4 className={footHead}>{s.footerExplore}</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li><Link to="/products" className={footLink}>{all}</Link></li>
            {site.categories.map((c) => <li key={c.id}><Link to="/products" search={{ category: c.name }} className={footLink}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className={footHead}>{s.footerCompany}</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li><Link to="/about" className={footLink}>About Us</Link></li>
            <li><Link to="/trade" className={footLink}>Trade &amp; Partnerships</Link></li>
            <li><Link to="/contactus" className={footLink}>Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={footHead}>{s.footerSocial}</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {s.socials.map((x) => <li key={x.label + x.url}><a href={x.url} target="_blank" rel="noreferrer" className={footLink}>{x.label}</a></li>)}
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-ink-line px-6 py-6 text-xs text-ink-muted">
        <span>{s.copyright}</span>
        <span className="flex flex-wrap gap-6">
          <Link to="/terms" className={footLink}>{site.content("terms").title}</Link>
          <Link to="/returns" className={footLink}>{site.content("returns").title}</Link>
        </span>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  const s = useSite().content("settings");
  if (s.showWhatsappButton.trim().toLowerCase() === "no" || !s.whatsapp) return null;
  return (
    <a href={waHref(s.whatsapp, s.whatsappMessage)} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

export function ProductCard({ slug, name, note, price, image, tall }: { slug: string; name: string; note?: string; price?: number; image: string; tall?: boolean }) {
  return (
    <div className="group relative">
      <Link to="/product/$slug" params={{ slug }} aria-label={name} className="block">
        <div className={`overflow-hidden rounded-xl ${tall ? "aspect-[4/5]" : "aspect-square"}`}>
          <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        {note !== undefined && (
          <div className="mt-3 flex justify-between">
            <div><p className="font-display font-semibold">{name}</p><p className="text-xs text-muted-foreground">{note}</p></div>
            {price !== undefined && <span className="shrink-0 font-display font-semibold">{formatPrice(price)}</span>}
          </div>
        )}
      </Link>
      <WishButton slug={slug} name={name} className="absolute right-3 top-3" />
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
