import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CreditCard, Laugh, Smile, Landmark, MapPin, Minus, Plus, ShieldCheck, Smartphone, Truck, Wallet } from "lucide-react";
import { Page } from "@/components/site";
import { products, slugify, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/currency";
import { detailsFor } from "@/lib/product-details";
import { shop, useShop } from "@/lib/shop";
import { checkPincode, type DeliveryResult } from "@/lib/delivery";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const p = products.find((x) => slugify(x.name) === params.slug);
    const title = p ? `${p.name} — Layer & Loop` : "Object — Layer & Loop";
    const desc = p ? `${p.note}. ${p.category} for ${p.spaces.join(", ")}.` : "Objects by Layer & Loop.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => productOr404(params.slug),
  component: ProductDetail,
});

const productOr404 = (slug: string): Product => {
  const p = products.find((x) => slugify(x.name) === slug);
  if (!p) throw notFound();
  return p;
};

const payments = [
  { icon: CreditCard, label: "Credit card" },
  { icon: CreditCard, label: "Debit card" },
  { icon: Smartphone, label: "UPI" },
  { icon: Landmark, label: "Net banking" },
  { icon: Wallet, label: "Wallets" },
];

function ProductDetail() {
  const { slug } = Route.useParams();
  const p = productOr404(slug);
  const d = detailsFor(p);
  const { wishlist } = useShop();
  const wished = wishlist.includes(slug);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [pin, setPin] = useState("");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);

  const addToCart = () => {
    shop.add(slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Page>
      <section className="mx-auto grid max-w-7xl items-start gap-12 px-6 py-16 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl md:sticky md:top-24">
          <img src={p.image} alt={p.name} className="aspect-[4/5] w-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{p.category}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{p.name}</h1>
          <p className="mt-2 text-muted-foreground">{p.note}</p>
          <p className="mt-5 max-w-md">{d.short}</p>

          <p className="mt-8 font-display text-3xl font-semibold">{formatPrice(p.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">Made for</p>
          <p className="mt-2 text-sm">{p.spaces.join(" · ")}</p>

          <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">Size &amp; specification</p>
          <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
            {d.specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-border">
              <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="p-3"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center text-sm">{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty(Math.min(10, qty + 1))} className="p-3"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={addToCart} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-foreground px-6 py-3 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background">
              {added ? <><Check className="h-4 w-4" /> Added</> : "Add to cart"}
            </button>
            <button aria-label={wished ? "Remove from favourites" : "Add to favourites"} aria-pressed={wished} onClick={() => shop.toggleWish(slug)} className="rounded-full border border-border p-3 transition-colors hover:bg-muted">
              {wished ? <Laugh className="h-5 w-5 text-primary" /> : <Smile className="h-5 w-5" />}
            </button>
          </div>
          <button onClick={() => { shop.add(slug, qty); navigate({ to: "/cart" }); }} className="mt-3 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
            Buy now
          </button>

          <form onSubmit={(e) => { e.preventDefault(); setDelivery(checkPincode(pin)); }} className="mt-8 rounded-xl bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-primary" /> Check delivery</p>
            <div className="mt-3 flex gap-2">
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter PIN code" aria-label="PIN code" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <button className="rounded-md border border-foreground px-4 text-sm font-medium">Check</button>
            </div>
            {delivery && <p className={`mt-2 text-xs ${delivery.ok ? "text-foreground" : "text-destructive"}`}>{delivery.message}</p>}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Ships across India</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> 7-day easy returns</span>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Payment options</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {payments.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs"><Icon className="h-3.5 w-3.5" />{label}</span>
              ))}
            </div>
          </div>

          <div className="mt-10 divide-y divide-border border-y border-border">
            <details open className="group py-4">
              <summary className="cursor-pointer list-none font-display font-semibold">About {p.name}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.long}</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-display font-semibold">Object care &amp; wear</summary>
              <dl className="mt-3 space-y-3 text-sm">
                {d.care.map(([k, v]) => (<div key={k}><dt className="font-medium">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>))}
              </dl>
            </details>
          </div>

          <Link to="/products" className="mt-10 inline-flex text-sm font-semibold underline-offset-4 hover:underline">← Back to All Objects</Link>
        </div>
      </section>
    </Page>
  );
}
