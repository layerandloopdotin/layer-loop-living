import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Menu, MessageCircle, ShoppingBag, User } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/currency";
import { shop, useShop } from "@/lib/shop";
import { useSite, waHref } from "@/lib/site";
import { img } from "@/lib/media";
import { WorldSwitch } from "@/components/worlds";
import { useWorld } from "@/lib/world";
import { CartPanel, HeaderSearch, HoverMenu, ProductsPanel, ProfilePanel, WishlistPanel } from "@/components/header-menus";

/** Wishlist toggle — an outline heart that fills in once saved. */
export function WishButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const { wishlist } = useShop();
  const on = wishlist.includes(slug);
  return (
    <button type="button" aria-label={on ? `Remove ${name} from favourites` : `Add ${name} to favourites`} aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); shop.toggleWish(slug); }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground transition-transform hover:scale-110 ${className}`}>
      <Heart className={`h-5 w-5 ${on ? "text-primary" : ""}`} strokeWidth={on ? 2.25 : 1.75} fill={on ? "currentColor" : "none"} />
    </button>
  );
}

export function Logo({ dot = false }: { dot?: boolean }) {
  const s = useSite().content("settings");
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2">
      {s.logoMode === "image" && s.logoImage ? <img src={img(s.logoImage)} alt={s.brand} className="h-8 w-auto max-w-36 object-contain md:h-10 md:max-w-48" /> : <>
        {dot && <span className="h-4 w-4 shrink-0 rounded-full bg-primary" />}
        <span className="truncate whitespace-nowrap font-display text-base font-bold md:text-lg">{s.brand}</span>
      </>}
    </Link>
  );
}

function HeaderIcon({ to, label, count, children }: { to: "/cart" | "/wishlist" | "/account"; label: string; count: number; children: ReactNode }) {
  return (
    <Link to={to} aria-label={`${label}${count ? ` (${count})` : ""}`} className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-ink-foreground transition-colors hover:border-ink-foreground">
      {children}
      {count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{count}</span>}
    </Link>
  );
}

function MobileMenu() {
  const s = useSite().content("settings");
  const world = useWorld();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label="Open menu" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-ink-foreground md:hidden">
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[85vw] max-w-sm flex-col border-ink-line bg-ink text-ink-foreground">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="mt-10"><WorldSwitch /></div>
        <nav className="mt-4 flex flex-col">
          {s.nav.filter((n) => n.path !== "/contactus" && !(world === "culture" && n.path === "/custom")).map((n) => (
            <Link key={n.label + n.path} to={n.path as "/"} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
              className="border-b border-ink-line py-4 font-display text-2xl font-bold uppercase text-ink-muted"
              activeProps={{ className: "!text-ink-foreground" }}>{n.label}</Link>
          ))}
        </nav>
        <Link to="/account" onClick={() => setOpen(false)} className="border-b border-ink-line py-4 font-display text-2xl font-bold uppercase text-ink-muted">My account</Link>
        <div className="mt-auto space-y-3 pb-4">
          <Link to="/contactus" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
            {s.contactButton} <ArrowRight className="h-4 w-4" />
          </Link>
          {s.whatsapp && <a href={waHref(s.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-ink-line px-5 py-3 text-sm"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-ink-muted">
            {s.socials.map((x) => <a key={x.label + x.url} href={x.url} target="_blank" rel="noreferrer">{x.label}</a>)}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const hiddenNav = (path: string) => path === "/" || path === "/contactus";

export function SiteHeader() {
  const { cart, wishlist } = useShop();
  const s = useSite().content("settings");
  const [searching, setSearching] = useState(false);
  const world = useWorld();
  const nav = s.nav.filter((n) => !hiddenNav(n.path) && !(world === "culture" && n.path === "/custom"));
  return (
    <header className="relative z-40 border-b border-ink-line bg-ink text-ink-foreground">
      <div className="border-b border-ink-line/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 md:px-6">
          <WorldSwitch compact />
          <span className="hidden text-[11px] text-ink-muted sm:block">{world === "culture" ? "Pop collectibles & desk culture" : "Calm lighting & living objects"}</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:gap-6 md:px-6 md:py-4">
        <div className={`flex min-w-0 items-center gap-10 ${searching ? "max-md:hidden" : ""}`}>
          <Logo />
          {!searching && <nav className="hidden items-center gap-7 text-sm md:flex">
            {nav.map((n) => {
              const link = (
                <Link key={n.label + n.path} to={n.path as "/"} activeOptions={{ exact: true }}
                  className="pb-1 text-ink-muted transition-colors hover:text-ink-foreground"
                  activeProps={{ className: "border-b-2 border-ink-foreground !text-ink-foreground" }}>
                  {n.label}
                </Link>
              );
              return n.path === "/products"
                ? <HoverMenu key={n.label + n.path} trigger={link} align="left" width="w-[42rem]"><ProductsPanel /></HoverMenu>
                : link;
            })}
          </nav>}
        </div>
        <div className={`flex items-center justify-end gap-2 ${searching ? "min-w-0 flex-1" : "shrink-0"}`}>
          <HeaderSearch open={searching} setOpen={setSearching} />
          <HoverMenu trigger={<HeaderIcon to="/wishlist" label="Favourites" count={wishlist.length}><Heart className="h-4 w-4" fill={wishlist.length ? "currentColor" : "none"} /></HeaderIcon>}><WishlistPanel /></HoverMenu>
          <HoverMenu trigger={<HeaderIcon to="/cart" label="Cart" count={cart.reduce((sum, c) => sum + c.qty, 0)}><ShoppingBag className="h-4 w-4" /></HeaderIcon>}><CartPanel /></HoverMenu>
          <HoverMenu width="w-60" trigger={<HeaderIcon to="/account" label="My account" count={0}><User className="h-4 w-4" /></HeaderIcon>}><ProfilePanel /></HoverMenu>
          {!searching && <MobileMenu />}
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
            <li><Link to="/custom" className={footLink}>Custom &amp; Bespoke</Link></li>
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
