import { createFileRoute, Link } from "@tanstack/react-router";
import { Laugh } from "lucide-react";
import { DarkHero, Page } from "@/components/site";
import { useSite } from "@/lib/site";
import { formatPrice } from "@/lib/currency";
import { shop, useShop } from "@/lib/shop";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Layer & Loop" },
      { name: "description", content: "Objects you've saved from Layer & Loop." },
      { property: "og:title", content: "Wishlist — Layer & Loop" },
      { property: "og:description", content: "Your saved Layer & Loop objects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useShop();
  const site = useSite();
  const items = site.products.filter((p) => wishlist.includes(p.slug));
  return (
    <Page>
      <DarkHero eyebrow="Wishlist" title="Saved for later" />
      <section className="mx-auto max-w-7xl px-6 py-16">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Nothing saved yet — tap the smiley on any object.</p>
            <Link to="/products" className="mt-6 inline-flex rounded-full border border-foreground px-6 py-3 text-sm font-semibold">Browse objects</Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {items.map((p) => {
              const slug = p.slug;
              return (
                <div key={slug}>
                  <div className="relative overflow-hidden rounded-xl">
                    <Link to="/product/$slug" params={{ slug }}><img src={p.image} alt={p.name} className="aspect-square w-full object-cover" /></Link>
                    <button aria-label={`Remove ${p.name}`} onClick={() => shop.toggleWish(slug)} className="absolute right-3 top-3 rounded-full bg-background p-2"><Laugh className="h-4 w-4 text-primary" /></button>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <div><p className="font-display font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.note}</p></div>
                    <span className="font-display font-semibold">{formatPrice(p.price)}</span>
                  </div>
                  <button onClick={() => { shop.add(slug); shop.toggleWish(slug); }} className="mt-3 w-full rounded-full border border-foreground py-2.5 text-sm font-semibold">Move to cart</button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Page>
  );
}
