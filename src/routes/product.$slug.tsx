import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Page } from "@/components/site";
import { products, slugify, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/currency";

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
        { property: "og:type", content: "website" },
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

function ProductDetail() {
  const p = Route.useLoaderData();
  return (
    <Page>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl">
          <img src={p.image} alt={p.name} className="aspect-[4/5] w-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{p.category}</p>
          <h1 className="mt-3 font-display text-5xl font-bold">{p.name}</h1>
          <p className="mt-4 text-muted-foreground">{p.note}</p>
          <p className="mt-8 font-display text-2xl font-semibold">{formatPrice(p.price)}</p>
          <p className="mt-10 text-xs uppercase tracking-widest text-muted-foreground">Made for</p>
          <p className="mt-3 text-sm">{p.spaces.join(" · ")}</p>
          <Link
            to="/products"
            className="mt-12 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Back to All Objects
          </Link>
        </div>
      </section>
    </Page>
  );
}
