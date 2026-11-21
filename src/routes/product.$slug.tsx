import { ENGRAVING_REMARKS_MAX, engravingImages, engravingSchema, type Engraving } from "@/lib/engraving";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type PointerEvent } from "react";
import { Check, CreditCard, Heart, Landmark, Link2, MapPin, Minus, Plus, Share2, ShieldCheck, Smartphone, Truck, Wallet, Banknote } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ratingSummary, reviewImg, type Review } from "@/lib/reviews";
import { Stars } from "@/components/account/review-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Product } from "@/lib/catalog";
import { Page } from "@/components/site";
import { ProductGallery } from "@/components/product-gallery";
import { galleryFor, unitPrice, type Variant } from "@/lib/catalog";
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
  if (l.includes("cash") || l.includes("cod")) return Banknote;
  return CreditCard;
};

/** Small photo that trails the cursor while a variant option is hovered. */
function VariantPeek({ src, name, x, gridTop, gridBottom }: { src: string; name: string; x: number; gridTop: number; gridBottom: number }) {
  const size = 140;
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const top = gridBottom + 10 + size <= vh ? gridBottom + 10 : Math.max(12, gridTop - size - 10);
  return (
    <div aria-hidden className="pointer-events-none fixed z-50" style={{ left: Math.max(12, Math.min(x - size / 2, vw - size)), top }}>
      <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-border shadow-2xl">
        <img src={src} alt="" width={640} height={640} loading="lazy" className="h-full w-full object-cover" />
        <p className="absolute inset-x-1 bottom-1 truncate rounded-md bg-foreground/90 px-1.5 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-background">{name}</p>
      </div>
    </div>
  );
}



function useReviews(slug: string) {
  return useQuery({ queryKey: ["reviews", slug], queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("id, product_slug, author_name, rating, comment, images, created_at").eq("product_slug", slug).eq("status", "approved").order("created_at", { ascending: false });
    if (error) throw error; return data as Review[];
  } });
}

function RatingLine({ slug }: { slug: string }) {
  const q = useReviews(slug);
  const s = ratingSummary(q.data ?? []);
  if (!s.count) return null;
  return <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Stars value={Math.round(s.average)} size="h-3.5 w-3.5" /> {s.average} · {s.count} review{s.count > 1 ? "s" : ""}</a>;
}

function ReviewsSection({ slug }: { slug: string }) {
  const q = useReviews(slug);
  const s = ratingSummary(q.data ?? []);
  if (!s.count) return null;
  return (
    <section id="reviews" className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-20">
      <div className="flex items-baseline gap-3"><h2 className="font-display text-xl font-semibold">Reviews</h2><span className="text-sm text-muted-foreground">{s.average} / 5 · {s.count}</span></div>
      <ul className="mt-6 grid gap-6 md:grid-cols-2">
        {q.data!.slice(0, 6).map((r) => (
          <li key={r.id} className="border-t border-border pt-4">
            <div className="flex items-center gap-3"><Stars value={r.rating} size="h-3.5 w-3.5" /><span className="text-xs text-muted-foreground">{r.author_name || "Customer"} · {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span></div>
            {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
            {r.images.length > 0 && <div className="mt-3 flex gap-2">{r.images.map((im) => <a key={im} href={reviewImg(im)} target="_blank" rel="noreferrer"><img src={reviewImg(im)} alt="Customer photo" loading="lazy" className="h-16 w-16 rounded-lg object-cover" /></a>)}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShareMenu({ name }: { name: string }) {
  const url = () => window.location.href;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); toast.success("Link copied"); } catch { toast.error("Couldn't copy the link"); }
  };
  const native = async () => {
    try { await navigator.share({ title: name, text: `${name} — Layer & Loop`, url: url() }); } catch { /* dismissed */ }
  };
  const enc = (v: string) => encodeURIComponent(v);
  const links = () => [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${name} — ${url()}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url())}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(name)}&url=${enc(url())}` },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${enc(url())}&description=${enc(name)}` },
    { label: "Email", href: `mailto:?subject=${enc(name)}&body=${enc(url())}` },
  ];
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground"><Share2 className="h-3.5 w-3.5" /> Share</button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-44 p-1">
          {typeof navigator !== "undefined" && "share" in navigator && <button type="button" onClick={native} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted">Share via apps…</button>}
          <button type="button" onClick={copy} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"><Link2 className="h-3.5 w-3.5" /> Copy link</button>
          {typeof window !== "undefined" && links().map((l) => <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="block rounded-md px-3 py-2 text-sm hover:bg-muted">{l.label}</a>)}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function BoughtTogether({ p, others, title }: { p: Product; others: Product[]; title: string }) {
  const [picked, setPicked] = useState<string[]>(others.map((o) => o.slug));
  const [added, setAdded] = useState(false);
  if (others.length === 0) return null;
  const all = [p, ...others];
  const total = all.filter((x) => x.slug === p.slug || picked.includes(x.slug)).reduce((s, x) => s + x.price, 0);
  const addAll = () => { shop.add(p.slug, 1); picked.forEach((sl) => shop.add(sl, 1)); setAdded(true); setTimeout(() => setAdded(false), 1800); };
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div className="-mx-6 flex items-center gap-3 overflow-x-auto px-6 pb-2">
          {all.map((x, i) => {
            const on = x.slug === p.slug || picked.includes(x.slug);
            return (
              <div key={x.slug} className="flex shrink-0 items-center gap-3">
                {i > 0 && <Plus className="h-4 w-4 text-muted-foreground" />}
                <label className={`block w-40 cursor-pointer rounded-xl border p-2 transition ${on ? "border-foreground" : "border-border opacity-60"}`}>
                  <div className="relative">
                    <img src={x.image} alt={x.name} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
                    <input type="checkbox" checked={on} disabled={x.slug === p.slug} onChange={() => setPicked((s) => s.includes(x.slug) ? s.filter((v) => v !== x.slug) : [...s, x.slug])} className="absolute left-2 top-2 h-4 w-4 accent-primary" aria-label={`Include ${x.name}`} />
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold">{i === 0 ? "This item: " : ""}{x.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(x.price)}</p>
                </label>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl bg-card p-5 lg:w-64">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total for {1 + picked.length} items</p>
          <p className="mt-1 font-display text-2xl font-semibold">{formatPrice(total)}</p>
          <button onClick={addAll} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">{added ? "Added to cart" : "Add all to cart"}</button>
        </div>
      </div>
    </section>
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
  const [peek, setPeek] = useState<{ src: string; name: string; x: number; gridTop: number; gridBottom: number } | null>(null);
  const showPeek = (v: Variant, e: PointerEvent<HTMLButtonElement>) => {
    if (!v.image || e.pointerType !== "mouse") return;
    const g = variantGrid.current?.getBoundingClientRect();
    setPeek({ src: v.image, name: v.name, x: e.clientX, gridTop: g?.top ?? e.clientY, gridBottom: g?.bottom ?? e.clientY });
  };

  const [pin, setPin] = useState("");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);

  const [engrave, setEngrave] = useState(false);
  const [eng, setEng] = useState<Engraving>({ text: "", remarks: "" });
  const [engErr, setEngErr] = useState<string | null>(null);
  const chosen = engrave && p.engraving.enabled ? eng : undefined;
  const exampleImages = engravingImages(p.engraving);
  const addToCart = () => {
    if (chosen) {
      const r = engravingSchema(p.engraving).safeParse(chosen);
      if (!r.success) { setEngErr(r.error.issues[0]?.message ?? "Check the engraving"); return; }
      setEngErr(null);
    }
    shop.add(slug, qty, variant, chosen ? { ...chosen, text: chosen.text.trim() } : undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Page>
      <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 pb-12 pt-8 md:gap-12 md:px-6 md:py-16 md:grid-cols-2">
        <div className="min-w-0">
          <ProductGallery key={slug + colour} name={p.name} images={galleryFor(p, colour)} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{p.categories.join(" · ")}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{p.name}</h1>
          <p className="mt-2 text-muted-foreground">{p.note}</p>
          <RatingLine slug={slug} />
          <div className="mt-4"><ShareMenu name={p.name} /></div>
          <p className="mt-5 max-w-md">{p.short}</p>

          <p className="mt-8 font-display text-3xl font-semibold">{formatPrice(unitPrice(p, variant, chosen))}{p.compareAt && p.compareAt > p.price && <s className="ml-3 text-lg font-normal text-muted-foreground">{formatPrice(p.compareAt)}</s>}</p>
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
          <div ref={variantGrid} role="radiogroup" aria-label="Variant" className="mt-3 grid gap-2 sm:grid-cols-2">
            {p.variants.map((v) => (
              <button key={v.name} type="button" role="radio" aria-checked={variant === v.name} onClick={() => setVariant(v.name)}
                onPointerEnter={(e) => showPeek(v, e)}
                onPointerMove={(e) => showPeek(v, e)}


                onPointerLeave={() => setPeek(null)}
                className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${variant === v.name ? "border-foreground bg-card" : "border-border hover:border-muted-foreground"}`}>
                <span>{v.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{v.price > 0 ? `+ ${formatPrice(v.price)}` : "Included"}</span>
              </button>
            ))}
          </div></>}
          {peek && <VariantPeek {...peek} />}

          {p.engraving.enabled && <div className="mt-8 rounded-xl border border-border p-4">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span><span className="font-semibold">Personalise with engraving</span><span className="ml-2 text-xs text-muted-foreground">+ {formatPrice(p.engraving.price)}</span></span>
              <input type="checkbox" checked={engrave} onChange={(e) => setEngrave(e.target.checked)} className="h-4 w-4 accent-primary" />
            </label>
            {engrave && <div className="mt-4 space-y-4">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">Words to engrave
                <input value={eng.text} maxLength={p.engraving.maxChars} onChange={(e) => setEng({ ...eng, text: e.target.value })} placeholder="A name, initials or a date" className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground" />
                <span className="mt-1 block text-right normal-case tracking-normal">{eng.text.length}/{p.engraving.maxChars}</span>
              </label>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">Remarks
                <input value={eng.remarks ?? ""} maxLength={ENGRAVING_REMARKS_MAX} onChange={(e) => setEng({ ...eng, remarks: e.target.value })} placeholder="Any font preferences?" className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground" />
              </label>
              {exampleImages.length > 0 && <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">How engraving looks</p>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{exampleImages.map((src, n) => <img key={n} src={src} alt={`Engraving example ${n + 1}`} loading="lazy" className="h-24 w-32 shrink-0 rounded-lg object-cover" />)}</div>
              </div>}
              <p className="text-xs text-muted-foreground">Engraved pieces are made for you, so they can't be returned. They're still replaced if they arrive damaged.</p>
              {engErr && <p role="alert" className="text-xs text-destructive">{engErr}</p>}
            </div>}
          </div>}


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
              {wished ? <Heart className="h-5 w-5 text-primary" fill="currentColor" /> : <Heart className="h-5 w-5" />}
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
              {(c.payments.some((x) => /cash|cod/i.test(x)) ? c.payments : [...c.payments, "Cash on delivery (COD)"]).map((label) => { const Icon = payIcon(label); return (
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
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-display font-semibold">{c.returnPolicyLabel}</summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{c.returnPolicy}</p>
              <Link to="/returns" className="mt-3 inline-flex text-xs underline">Read the full policy</Link>
            </details>
          </div>

          <Link to="/products" className="mt-10 inline-flex text-sm font-semibold underline-offset-4 hover:underline">{c.backLabel}</Link>
        </div>
      </section>
      <ReviewsSection slug={slug} />
      <BoughtTogether key={slug} p={p} title={c.fbtLabel} others={[...site.products.filter((x) => x.world === p.world).filter((x) => x.slug !== p.slug && x.categories.some((k) => p.categories.includes(k))), ...site.products.filter((x) => x.world === p.world).filter((x) => x.slug !== p.slug && !x.categories.some((k) => p.categories.includes(k)))].slice(0, 2)} />
    </Page>
  );
}
