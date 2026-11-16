import { createFileRoute, Link } from "@tanstack/react-router";
import { unitPrice } from "@/lib/catalog";
import { Minus, Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { applyCoupon, cartTotals, FREE_SHIPPING_FROM } from "@/lib/pricing";
import { DarkHero, Page } from "@/components/site";
import { useSite } from "@/lib/site";
import { formatPrice } from "@/lib/currency";
import { shop, useShop } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Layer & Loop" },
      { name: "description", content: "Review the 3D printed objects in your Layer & Loop cart." },
      { property: "og:title", content: "Your Cart — Layer & Loop" },
      { property: "og:description", content: "Objects you've picked from Layer & Loop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { cart } = useShop();
  const site = useSite();
  const lines = cart.flatMap((c) => {
    const p = site.bySlug(c.slug);
    return p ? [{ ...c, p }] : [];
  });
  const total = lines.reduce((s, l) => s + unitPrice(l.p, l.variant) * l.qty, 0);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<string>();
  const [msg, setMsg] = useState("");
  const t = cartTotals(total, coupon);

  return (
    <Page>
      <DarkHero eyebrow="Cart" title="Your cart" />
      <section className="mx-auto max-w-7xl px-6 py-16">
        {lines.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/products" className="mt-6 inline-flex rounded-full border border-foreground px-6 py-3 text-sm font-semibold">Browse objects</Link>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-[1.6fr_1fr]">
            <ul className="divide-y divide-border border-y border-border">
              {lines.map(({ slug, qty, p, variant }) => (
                <li key={slug + (variant ?? "")} className="flex items-center gap-5 py-5">
                  <Link to="/product/$slug" params={{ slug }} className="shrink-0"><img src={p.image} alt={p.name} className="h-24 w-24 rounded-lg object-cover" /></Link>
                  <div className="flex-1">
                    <p className="font-display font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.note}</p>
                    {variant && <p className="mt-1 text-xs">{variant}</p>}
                    <div className="mt-3 inline-flex items-center rounded-full border border-border">
                      <button aria-label="Decrease" onClick={() => shop.setQty(slug, qty - 1, variant)} className="p-2"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm">{qty}</span>
                      <button aria-label="Increase" onClick={() => shop.setQty(slug, qty + 1, variant)} className="p-2"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <span className="font-display font-semibold">{formatPrice(unitPrice(p, variant) * qty)}</span>
                  <button aria-label={`Remove ${p.name}`} onClick={() => shop.setQty(slug, 0, variant)} className="p-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-2xl bg-card p-7 md:sticky md:top-24">
              <p className="font-display text-lg font-semibold">Order summary</p>
              <form onSubmit={(e) => { e.preventDefault(); const r = applyCoupon(code, total); if (r.ok) { setCoupon(r.code); setMsg(r.label + " applied."); setCode(""); } else setMsg(r.message); }} className="mt-5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground" htmlFor="coupon">Coupon code</label>
                <div className="mt-2 flex gap-2">
                  <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WELCOME10" className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm uppercase" />
                  <button className="rounded-md border border-foreground px-4 text-sm font-medium">Apply</button>
                </div>
                {msg && <p className="mt-2 text-xs text-muted-foreground">{msg}</p>}
                {coupon && <button type="button" onClick={() => { setCoupon(undefined); setMsg(""); }} className="mt-2 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs"><Tag className="h-3 w-3" />{coupon}<X className="h-3 w-3" /></button>}
              </form>
              <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(t.subtotal)}</span></div>
                {t.discount > 0 && <div className="flex justify-between text-primary"><span>Discount ({coupon})</span><span>− {formatPrice(t.discount)}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span>{t.shipping === 0 ? "Free" : formatPrice(t.shipping)}</span></div>
                <p className="text-xs text-muted-foreground">{t.shipping === 0 ? "You've unlocked free delivery." : `Add ${formatPrice(FREE_SHIPPING_FROM - t.subtotal)} more for free delivery.`} Delivery in 1–7 days depending on PIN code.</p>
              </div>
              <div className="mt-5 flex justify-between border-t border-border pt-5 font-display text-lg font-semibold"><span>Total</span><span>{formatPrice(t.total)}</span></div>
              <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
              <Link to="/checkout" search={{ coupon }} className="mt-6 block w-full rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground">Checkout</Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">Cards, UPI, net banking &amp; wallets</p>
            </aside>
          </div>
        )}
      </section>
    </Page>
  );
}
