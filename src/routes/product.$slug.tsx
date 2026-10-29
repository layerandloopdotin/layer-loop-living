import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Check, CreditCard, Laugh, Smile, Landmark, MapPin, Minus, Plus, ShieldCheck, Smartphone, Truck, Wallet } from "lucide-react";
import { Page } from "@/components/site";
import { ProductGallery } from "@/components/product-gallery";
import { galleryFor, unitPrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/currency";
import { shop, useShop } from "@/lib/shop";
import { checkPincode, type DeliveryResult } from "@/lib/delivery";
import { siteQuery, useSite } from "@/lib/site";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(siteQuery);
    const p = data.products.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return { name: p.name, note: p.tagline, short: p.short_description };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Layer & Loop` : "Object — Layer & Loop";
    const desc = loaderData ? loaderData.short || loaderData.note : "Objects by Layer & Loop.";
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
  component: ProductDetail,
});

const payIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("upi")) return Smartphone;
  if (l.includes("bank")) return Landmark;
  if (l.includes("wallet")) return Wallet;
  return CreditCard;
};

/** Small photo that trails the cursor while a variant option is hovered. */
function VariantPeek({ src, name, x, y }: { src: string; name: string; x: number; y: number }) {
  const size = 186;
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const below = y + 34 + size < vh;
  return (
    <div aria-hidden className="pointer-events-none fixed z-50" style={{ left: Math.max(12, Math.min(x + 20, vw - size)), top: below ? y + 34 : Math.max(12, y - size - 12) }}>

      <img src={src} alt="" width={640} height={640} loading="lazy" className="h-40 w-40 rounded-xl border border-border object-cover shadow-2xl" />
      <p className="mt-1.5 rounded-md bg-foreground px-2 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-background">{name}</p>
    </div>
  );
}


function ProductDetail() {
  const { slug } = Route.useParams();
  const site = useSite();
  const c = site.content("catalog");
  const p = site.bySlug(slug);
  if (!p) throw notFound();
  const { wishlist } = useShop();
  const wished = wishlist.includes(slug);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [colour, setColour] = useState(p.colours[0]?.name ?? "");
  const [variant, setVariant] = useState(p.variants[0]?.name);
  const variantGrid = useRef<HTMLDivElement>(null);
  const [peek, setPeek] = useState<{ src: string; name: string; x: number; y: number } | null>(null);
  const [pin, setPin] = useState("");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);

  const addToCart = () => {
    shop.add(slug, qty, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Page>
      <section className="mx-auto grid max-w-7xl items-start gap-12 px-6 py-16 md:grid-cols-2">
        <ProductGallery key={slug + colour} name={p.name} images={galleryFor(p, colour)} />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{p.categories.join(" · ")}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{p.name}</h1>
          <p className="mt-2 text-muted-foreground">{p.note}</p>
          <p className="mt-5 max-w-md">{p.short}</p>

          <p className="mt-8 font-display text-3xl font-semibold">{formatPrice(unitPrice(p, variant))}{p.compareAt && p.compareAt > p.price && <s className="ml-3 text-lg font-normal text-muted-foreground">{formatPrice(p.compareAt)}</s>}</p>
          <p className="mt-1 text-xs text-muted-foreground">{c.taxNote}</p>

          {p.spaces.length > 0 && <><p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">{c.madeForLabel}</p>
          <p className="mt-2 text-sm">{p.spaces.join(" · ")}</p></>}

          {p.colours.length > 0 && <><p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">{c.colourLabel} — <span className="normal-case tracking-normal text-foreground">{colour}</span></p>
          <div role="radiogroup" aria-label="Colour" className="mt-3 flex flex-wrap gap-3">
            {p.colours.map((cl) => (
              <button key={cl.name} type="button" role="radio" aria-checked={colour === cl.name} aria-label={cl.name} title={cl.name} onClick={() => setColour(cl.name)}
                className={`h-11 w-11 rounded-lg border p-1 transition ${colour === cl.name ? "border-foreground" : "border-border hover:border-muted-foreground"}`}>
                <span className="block h-full w-full rounded-md" style={{ background: cl.hex }} />
              </button>
            ))}
          </div></>}

          {p.variants.length > 0 && <><p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">{c.variantLabel || "Variant"}{p.variants.some((v) => v.image) && <span className="ml-2 normal-case tracking-normal">— hover an option to see it</span>}</p>
          <div role="radiogroup" aria-label="Variant" className="mt-3 grid gap-2 sm:grid-cols-2">
            {p.variants.map((v) => (
              <button key={v.name} type="button" role="radio" aria-checked={variant === v.name} onClick={() => setVariant(v.name)}
                onPointerEnter={(e) => { if (v.image && e.pointerType === "mouse") setPeek({ src: v.image, name: v.name, x: e.clientX, y: e.clientY }); }}
                onPointerMove={(e) => { if (v.image && e.pointerType === "mouse") setPeek({ src: v.image, name: v.name, x: e.clientX, y: e.clientY }); }}
                onPointerLeave={() => setPeek(null)}
                className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${variant === v.name ? "border-foreground bg-card" : "border-border hover:border-muted-foreground"}`}>
                <span>{v.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{v.price > 0 ? `+ ${formatPrice(v.price)}` : "Included"}</span>
              </button>
            ))}
          </div></>}
          {peek && <VariantPeek {...peek} />}


          {p.specs.length > 0 && <><p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">{c.specsLabel}</p>
          <dl className="mt-3 divide-y divide-border border-y border-border text-sm">
            {p.specs.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">{label}</dt><dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl></>}

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
          <button onClick={() => { shop.add(slug, qty, variant); navigate({ to: "/cart" }); }} className="mt-3 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground">
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
              <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> {c.shipsNote}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> {c.returnsNote}</span>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.paymentsLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.payments.map((label) => { const Icon = payIcon(label); return (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs"><Icon className="h-3.5 w-3.5" />{label}</span>
              ); })}
            </div>
          </div>

          <div className="mt-10 divide-y divide-border border-y border-border">
            <details open className="group py-4">
              <summary className="cursor-pointer list-none font-display font-semibold">About {p.name}</summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.long}</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-display font-semibold">{c.careLabel}</summary>
              <dl className="mt-3 space-y-3 text-sm">
                {p.care.map(({ label, value }) => (<div key={label}><dt className="font-medium">{label}</dt><dd className="text-muted-foreground">{value}</dd></div>))}
              </dl>
            </details>
          </div>

          <Link to="/products" className="mt-10 inline-flex text-sm font-semibold underline-offset-4 hover:underline">{c.backLabel}</Link>
        </div>
      </section>
    </Page>
  );
}
