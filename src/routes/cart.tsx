import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { DarkHero, Page } from "@/components/site";
import { products, slugify } from "@/lib/products";
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
  const lines = cart.flatMap((c) => {
    const p = products.find((x) => slugify(x.name) === c.slug);
    return p ? [{ ...c, p }] : [];
  });
  const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0);

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
              {lines.map(({ slug, qty, p }) => (
                <li key={slug} className="flex items-center gap-5 py-5">
                  <Link to="/product/$slug" params={{ slug }} className="shrink-0"><img src={p.image} alt={p.name} className="h-24 w-24 rounded-lg object-cover" /></Link>
                  <div className="flex-1">
                    <p className="font-display font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.note}</p>
                    <div className="mt-3 inline-flex items-center rounded-full border border-border">
                      <button aria-label="Decrease" onClick={() => shop.setQty(slug, qty - 1)} className="p-2"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm">{qty}</span>
                      <button aria-label="Increase" onClick={() => shop.setQty(slug, qty + 1)} className="p-2"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <span className="font-display font-semibold">{formatPrice(p.price * qty)}</span>
                  <button aria-label={`Remove ${p.name}`} onClick={() => shop.setQty(slug, 0)} className="p-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-2xl bg-card p-7">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="mt-5 flex justify-between border-t border-border pt-5 font-display text-lg font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
              <button disabled className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground opacity-60">Checkout — coming soon</button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Cards, UPI, net banking &amp; wallets</p>
            </aside>
          </div>
        )}
      </section>
    </Page>
  );
}
