import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Page, ProductCard } from "@/components/site";
import { InstagramStrip } from "@/components/instagram-strip";
import { CenterRail } from "@/components/center-rail";
import { featuredProducts, inWorld, worldCategories } from "@/lib/catalog";
import { setWorld } from "@/lib/world";
import { img } from "@/lib/media";
import { useSite } from "@/lib/site";

export const Route = createFileRoute("/space")({
  head: () => ({
    meta: [
      { title: "Space — Lighting & Living Objects | Layer & Loop" },
      {
        name: "description",
        content:
          "Sculptural, atmospheric lighting and objects crafted for interiors that feel timeless.",
      },
      { property: "og:title", content: "Space by Layer & Loop" },
      {
        property: "og:description",
        content: "Sculptural lighting and objects for everyday living.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpacePage,
});

function SpacePage() {
  useEffect(() => setWorld("space"), []);
  const site = useSite();
  const s = site.content("space");
  const c = site.content("home");
  const edit = featuredProducts(inWorld(site.products, "space")).slice(0, 3);
  const cats = worldCategories(site.categories, site.products, "space").filter((x) => x.image);
  const livingTitle = s.livingTitle || c.livingTitle;
  const livingImage = s.livingImage || c.livingImage;
  return (
    <Page>
      <section className="relative h-[70svh] min-h-[460px] max-h-[760px] w-full overflow-hidden bg-ink text-ink-foreground">
        <img
          src={img(s.image)}
          alt={s.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/25" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-12 pt-16 md:px-12 md:pb-16">
          {s.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              {s.eyebrow}
            </p>
          )}
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[1.08] md:text-6xl">
            {s.title}
          </h1>
          {s.text && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-foreground/85 md:text-base">
              {s.text}
            </p>
          )}
          <div className="mt-7">
            <Link
              to="/products"
              search={{ world: "space" }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              {s.ctaLabel || "Shop Space"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold uppercase md:text-4xl">
              {s.editTitle || c.editTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.editSubtitle || c.editSubtitle}</p>
          </div>
          <div className="hidden max-w-sm md:block">
            <p className="text-xs font-bold uppercase tracking-widest">
              {s.philosophyTitle || c.philosophyTitle}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {s.philosophyText || c.philosophyText}
            </p>
          </div>
          <Link
            to="/products"
            search={{ world: "space", featured: true }}
            className="inline-flex items-center gap-2 rounded-full border border-foreground px-5 py-2 text-sm"
          >
            {s.editButton || c.editButton} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CenterRail
          className="-mx-4 mt-6 md:-mx-6 md:mt-10"
          itemClass="w-[70%] md:w-[44%] lg:w-[36%]"
          edgeClass="w-[15%] md:w-[28%] lg:w-[32%]"
        >
          {edit.map((p) => (
            <ProductCard
              key={p.slug}
              slug={p.slug}
              name={p.name}
              note={p.note}
              price={p.price}
              image={p.image}
            />
          ))}
        </CenterRail>
      </section>

      <div className="overflow-hidden bg-ink py-4 text-ink-foreground">
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-xl font-semibold uppercase">
          {Array.from({ length: 12 }).map((_, n) => (
            <span key={n} className="px-4">
              {s.marquee || c.marquee}
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 md:flex md:justify-between md:gap-6">
          <div className="min-w-0">
            <h2 className="text-3xl font-extrabold uppercase md:text-4xl">
              {s.categoriesTitle || c.categoryTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {s.categoriesSubtitle || c.categorySubtitle}
            </p>
          </div>
          <Link
            to="/products"
            search={{ world: "space" }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-foreground px-4 py-2 text-xs md:px-5 md:text-sm"
          >
            {s.categoriesButton || c.categoryButton} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CenterRail
          className="-mx-4 mt-4 md:-mx-6 md:mt-10"
          itemClass="w-[55%] md:w-[40%] lg:w-[32%]"
          edgeClass="w-[22.5%] md:w-[30%] lg:w-[34%]"
          start={Math.max(
            cats.findIndex((x) => /collect/i.test(x.name)),
            0,
          )}
        >
          {cats.map((x) => (
            <Link
              key={x.id}
              to="/products"
              search={{ world: "space", category: x.name }}
              className="block"
            >
              <img
                src={x.image}
                alt={x.name}
                loading="lazy"
                className="aspect-[3/4] w-full rounded-xl object-cover"
              />
              <p className="mt-3 font-display text-sm font-semibold">{x.name}</p>
            </Link>
          ))}
        </CenterRail>
      </section>

      <section className="py-14 md:py-20">
        <h2 className="mx-auto max-w-xl px-4 text-center text-3xl font-bold md:text-4xl">
          {livingTitle}
        </h2>
        {livingImage && (
          <img
            src={img(livingImage)}
            alt={livingTitle}
            loading="lazy"
            width={1600}
            height={832}
            className="mt-8 h-[60svh] min-h-[340px] w-full object-cover md:mt-10"
          />
        )}
      </section>
      <InstagramStrip />
    </Page>
  );
}
