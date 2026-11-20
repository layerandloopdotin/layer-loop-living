import { Link, useNavigate } from "@tanstack/react-router";
import { Boxes, CreditCard, Heart, LogOut, MapPin, Mail, Package, Search, Star, User, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";
import { inWorld, searchProducts, unitPrice, worldCategories, type World } from "@/lib/catalog";
import { setWorld } from "@/lib/world";
import { shop, useShop } from "@/lib/shop";
import { useSite } from "@/lib/site";

/** Desktop hover dropdown: opens after a short pause, closes when the pointer leaves. */
export function HoverMenu({ trigger, children, align = "right", width = "w-80" }: { trigger: ReactNode; children: ReactNode; align?: "left" | "right"; width?: string }) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enter = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), 120); };
  const leave = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), 180); };
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave} onClick={() => setOpen(false)}>
      {trigger}
      {open && (
        <div className={`absolute top-full z-50 hidden pt-3 md:block ${align === "right" ? "right-0" : "left-0"}`}>
          <div className={`${width} rounded-xl border bg-background p-4 text-foreground shadow-xl animate-in fade-in slide-in-from-top-1 duration-150`}>{children}</div>
        </div>
      )}
    </div>
  );
}

export function ProductsPanel() {
  const site = useSite();
  const tile = (w: World, label: string, line: string) => {
    const items = inWorld(site.products, w).slice(0, 6);
    const cats = worldCategories(site.categories, site.products, w);
    return (
      <div className={`min-w-0 rounded-xl p-3 ${w === "culture" ? "bg-pop-blue/10" : "bg-muted"}`}>
        <Link to="/products" search={{ world: w }} onClick={() => setWorld(w)} className="flex items-baseline justify-between">
          <span className="font-display text-lg font-extrabold uppercase">{label}</span>
          <span className="text-xs underline">Shop all</span>
        </Link>
        <p className="text-xs text-muted-foreground">{line}</p>
        <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2">
          {items.map((p) => (
            <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} className="w-24 shrink-0 snap-start">
              <img src={p.image} alt={p.name} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              <p className="mt-1 truncate text-[11px] font-semibold">{p.name}</p>
            </Link>
          ))}
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {cats.map((c) => <Link key={c.id} to="/products" search={{ world: w, category: c.name }} onClick={() => setWorld(w)} className="rounded-full border bg-background px-2.5 py-0.5 text-[11px] hover:border-foreground">{c.name}</Link>)}
        </div>
      </div>
    );
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      {tile("space", "Space", "Lighting, vases & living objects")}
      {tile("culture", "Culture", "Collectibles & quirky desk pieces")}
    </div>
  );
}

export function CartPanel() {
  const { cart } = useShop();
  const site = useSite();
  const lines = cart.map((c) => ({ c, p: site.bySlug(c.slug) })).filter((x) => x.p);
  if (!lines.length) return <p className="text-sm text-muted-foreground">Your cart is empty.</p>;
  const total = lines.reduce((s, { c, p }) => s + unitPrice(p!, c.variant, c.engraving) * c.qty, 0);
  return (
    <div>
      <ul className="space-y-3">
        {lines.slice(0, 3).map(({ c, p }, i) => (
          <li key={i} className="flex gap-3">
            <img src={p!.image} alt="" className="h-14 w-14 rounded-md object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold">{p!.name}</p>
              {(c.variant || c.engraving?.text) && <p className="truncate text-xs text-muted-foreground">{[c.variant, c.engraving?.text && `Engraved: ${c.engraving.text}`].filter(Boolean).join(" · ")}</p>}
              <p className="text-xs text-muted-foreground">Qty {c.qty} · {formatPrice(unitPrice(p!, c.variant, c.engraving) * c.qty)}</p>
            </div>
          </li>
        ))}
      </ul>
      {lines.length > 3 && <p className="mt-2 text-xs text-muted-foreground">+{lines.length - 3} more</p>}
      <div className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to="/cart" className="rounded-full border px-3 py-2 text-center text-sm">View cart</Link>
        <Link to="/checkout" className="rounded-full bg-primary px-3 py-2 text-center text-sm text-primary-foreground">Checkout</Link>
      </div>
    </div>
  );
}

export function WishlistPanel() {
  const { wishlist } = useShop();
  const site = useSite();
  const items = wishlist.map((s) => site.bySlug(s)).filter(Boolean);
  if (!items.length) return <p className="text-sm text-muted-foreground">No favourites yet. Tap the heart on any piece to save it.</p>;
  return (
    <div>
      <ul className="max-h-72 space-y-3 overflow-y-auto">
        {items.map((p) => (
          <li key={p!.slug} className="flex items-center gap-3">
            <Link to="/product/$slug" params={{ slug: p!.slug }} className="flex min-w-0 flex-1 items-center gap-3">
              <img src={p!.image} alt="" className="h-12 w-12 rounded-md object-cover" />
              <div className="min-w-0 text-sm"><p className="truncate font-semibold">{p!.name}</p><p className="text-xs text-muted-foreground">{formatPrice(p!.price)}</p></div>
            </Link>
            <button type="button" onClick={(e) => { e.stopPropagation(); shop.add(p!.slug, 1, p!.variants[0]?.name); }} className="rounded-full border px-3 py-1 text-xs hover:border-foreground">Add to cart</button>
          </li>
        ))}
      </ul>
      <Link to="/wishlist" className="mt-3 inline-block text-sm font-medium underline">View favourites</Link>
    </div>
  );
}

function useSignedIn() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setOn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setOn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  return on;
}

const row = "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-muted";
export function ProfilePanel() {
  const signedIn = useSignedIn();
  const navigate = useNavigate();
  if (!signedIn) return (
    <div className="space-y-2">
      <Link to="/signin" className="block rounded-full bg-primary px-4 py-2 text-center text-sm text-primary-foreground">Sign in / Create account</Link>
      <Link to="/checkout" className="block rounded-full border px-4 py-2 text-center text-sm">Continue as guest</Link>
      <Link to="/contactus" className={row}><Mail className="h-4 w-4" /> Contact us</Link>
    </div>
  );
  return (
    <nav className="flex flex-col">
      <Link to="/account" className={row}><User className="h-4 w-4" /> Profile</Link>
      <Link to="/account/orders" className={row}><Package className="h-4 w-4" /> My orders</Link>
      <Link to="/account/designs" className={row}><Boxes className="h-4 w-4" /> My designs</Link>
      <Link to="/account/reviews" className={row}><Star className="h-4 w-4" /> Reviews</Link>
      <Link to="/account/wishlist" className={row}><Heart className="h-4 w-4" /> Wishlist</Link>
      <Link to="/account/addresses" className={row}><MapPin className="h-4 w-4" /> Addresses</Link>
      <Link to="/account/payments" className={row}><CreditCard className="h-4 w-4" /> Payments</Link>
      <Link to="/contactus" className={row}><Mail className="h-4 w-4" /> Contact us</Link>
      <button type="button" className={`${row} border-t`} onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/signin" }); }}><LogOut className="h-4 w-4" /> Log out</button>
    </nav>
  );
}

/** Search box that grows from the icon; shows live product/category matches. */
export function HeaderSearch({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const site = useSite();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, setOpen]);
  if (!open) return (
    <button type="button" aria-label="Search" onClick={() => setOpen(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-ink-foreground transition-colors hover:border-ink-foreground"><Search className="h-4 w-4" /></button>
  );
  const term = q.trim().toLowerCase();
  const cats = term ? site.categories.filter((c) => c.name.toLowerCase().includes(term)) : [];
  const spaces = term ? site.spaces.filter((s) => s.name.toLowerCase().includes(term)) : [];
  const hits = searchProducts(site.products, q).slice(0, 6);
  const close = () => { setOpen(false); setQ(""); };
  return (
    <div ref={box} className="relative min-w-0 flex-1 animate-in fade-in slide-in-from-right-4 duration-200">
      <form onSubmit={(e) => { e.preventDefault(); if (!term) return; navigate({ to: "/products", search: { q: q.trim() } }); close(); }}
        className="flex items-center gap-2 rounded-full border border-ink-line bg-ink px-4 py-2">
        <Search className="h-4 w-4 shrink-0 text-ink-muted" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lighting, vases, a product…" aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink-foreground outline-none placeholder:text-ink-muted" />
        <button type="button" aria-label="Close search" onClick={close}><X className="h-4 w-4 text-ink-muted" /></button>
      </form>
      {term && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-background p-3 text-foreground shadow-xl">
          {cats.length + spaces.length > 0 && <div className="mb-2 flex flex-wrap gap-2">
            {cats.map((c) => <Link key={c.id} to="/products" search={{ category: c.name }} onClick={close} className="rounded-full border px-3 py-1 text-xs">{c.name}</Link>)}
            {spaces.map((s) => <Link key={s.id} to="/products" search={{ q: s.name }} onClick={close} className="rounded-full border px-3 py-1 text-xs">{s.name}</Link>)}
          </div>}
          {hits.length ? <ul>{hits.map((p) => (
            <li key={p.slug}><Link to="/product/$slug" params={{ slug: p.slug }} onClick={close} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
              <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
              <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span><span className="text-xs text-muted-foreground">{formatPrice(p.price)}</span>
            </Link></li>))}</ul>
            : !cats.length && !spaces.length && <p className="p-2 text-sm text-muted-foreground">No matches for “{q}”.</p>}
        </div>
      )}
    </div>
  );
}

