import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Page } from "@/components/site";
import { CenterRail } from "@/components/center-rail";
import { InstagramStrip } from "@/components/instagram-strip";
import { ProductRail } from "@/components/worlds";
import { inWorld, worldCategories } from "@/lib/catalog";
import { img } from "@/lib/media";
import { useSite } from "@/lib/site";
import { setWorld } from "@/lib/world";

export const Route = createFileRoute("/culture")({
  head: () => ({
    meta: [
      { title: "Culture — Collectibles & Quirky Desk Pieces | Layer & Loop" },
      {
        name: "description",
        content:
          "Pop collectibles, figurines, quirky desk organisers and statement pieces, 3D printed in our studio.",
      },
      { property: "og:title", content: "Culture by Layer & Loop" },
      { property: "og:description", content: "Loud little objects for your desk and shelf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CulturePage,
});

function CulturePage() {
  useEffect(() => setWorld("culture"), []);
  const site = useSite();
  const c = site.content("culture");
  const products = inWorld(site.products, "culture");
  const drops = (
    products.some((p) => p.drop)
      ? products.filter((p) => p.drop)
      : products.some((p) => p.featured)
        ? products.filter((p) => p.featured)
        : products
  ).slice(0, 8);
  const cats = worldCategories(site.categories, site.products, "culture");
  const dropsIdx = drops.findIndex((p) => p.slug === "pit-stop-pen-stack");
  const dropsStart =
    dropsIdx > 0 && dropsIdx < drops.length - 1 ? dropsIdx : Math.floor((drops.length - 1) / 2);
  const catsIdx = cats.findIndex((x) => /quirky/i.test(x.name));
  const catsStart =
    catsIdx > 0 && catsIdx < cats.length - 1 ? catsIdx : Math.floor((cats.length - 1) / 2);

  return (
    <Page>
      <section className="relative h-[70svh] min-h-[460px] max-h-[760px] w-full overflow-hidden bg-ink text-ink-foreground">
        <img
          src={img(c.image)}
          alt={c.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/25" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-12 pt-16 md:px-12 md:pb-16">
          <div className="flex flex-wrap items-center gap-3">
            {c.eyebrow && (
              <p className="inline-block -rotate-2 rounded-md bg-pop-orange px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-foreground">
                {c.eyebrow}
              </p>
            )}
            {c.dropsTag && (
              <span className="inline-block rotate-1 rounded-full bg-pop-blue px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-pop-blue-foreground">
                {c.dropsTag}
              </span>
            )}
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[1.18] md:text-6xl md:leading-[1.14]">
            {c.title}
          </h1>
          {c.text && (
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-foreground/85 md:text-base">
              {c.text}
            </p>
          )}
          <div className="mt-7">
            <Link
              to="/products"
              search={{ world: "culture" }}
              className="inline-flex items-center gap-2 rounded-full bg-pop-blue px-6 py-3 text-sm font-semibold text-pop-blue-foreground transition-transform hover:scale-[1.02]"
            >
              {c.ctaLabel || "Shop all Culture"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {drops.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold uppercase leading-[1.2] md:text-4xl">
              {c.dropsTitle}
            </h2>
            <Link
              to="/products"
              search={{ world: "culture" }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-pop-blue px-5 py-2 text-sm font-semibold"
            >
              {c.dropsButton || "See everything"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductRail products={drops} tag={c.dropsTag} start={dropsStart} />
        </section>
      )}

      {c.ticker && (
        <div className="overflow-hidden bg-pop-blue py-3.5 text-pop-blue-foreground">
          <div className="flex w-max animate-marquee whitespace-nowrap font-display text-lg font-extrabold uppercase">
            {Array.from({ length: 10 }).map((_, n) => (
              <span key={n} className="px-4">
                {c.ticker}
              </span>
            ))}
          </div>
        </div>
      )}

      {cats.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold uppercase leading-[1.2] md:text-4xl">
              {c.categoriesTitle}
            </h2>
            <Link
              to="/products"
              search={{ world: "culture" }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-pop-blue px-5 py-2 text-sm font-semibold"
            >
              {c.categoriesButton || "Shop all"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CenterRail
            className="-mx-4 mt-8 md:-mx-6 md:mt-10"
            itemClass="w-[58%] md:w-[40%] lg:w-[32%]"
            edgeClass="w-[21%] md:w-[30%] lg:w-[34%]"
            start={catsStart}
          >
            {cats.map((x, n) => (
              <Link
                key={x.id}
                to="/products"
                search={{ world: "culture", category: x.name }}
                className="group block"
              >
                <div
                  className={`overflow-hidden rounded-2xl border-2 bg-card ${n % 2 ? "border-pop-orange" : "border-pop-blue"}`}
                >
                  {x.image ? (
                    <img
                      src={x.image}
                      alt={x.name}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] w-full items-center justify-center bg-ink p-6 text-center text-ink-foreground">
                      <span className="font-display text-2xl font-extrabold uppercase">
                        {x.name}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 font-display text-sm font-bold uppercase tracking-wide">
                  {x.name}
                </p>
              </Link>
            ))}
          </CenterRail>
        </section>
      )}

      {c.showcase && (
        <section className="py-14 md:py-20">
          <div className="px-4">
            <h2 className="mx-auto max-w-xl text-center text-3xl font-bold leading-[1.2] md:text-4xl">
              {c.livingTitle}
            </h2>
          </div>
          <img
            src={img(c.showcase)}
            alt={c.livingTitle}
            loading="lazy"
            width={1600}
            height={832}
            className="mt-8 h-[60svh] min-h-[340px] w-full object-cover md:mt-10"
          />
        </section>
      )}

      <InstagramStrip />
    </Page>
  );
}
