import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/site";
import { InstagramStrip } from "@/components/instagram-strip";
import {
  CoverCarousel,
  DesignProcess,
  WorldShowcase,
  StudioProjects,
  WorldPanels,
} from "@/components/worlds";
import { useContent } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Layer & Loop — 3D Printing Studio for Space and Culture" },
      {
        name: "description",
        content:
          "A 3D printing studio with two worlds: calm lighting and living objects in Space, pop collectibles and desk culture in Culture.",
      },
      { property: "og:title", content: "Layer & Loop — Two worlds, one studio" },
      {
        property: "og:description",
        content: "Calm lighting and objects in Space. Pop collectibles and desk pieces in Culture.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const c = useContent("home");
  return (
    <Page>
      <div data-world-neutral hidden />
      <CoverCarousel />
      <WorldPanels />
      <StudioProjects />
      <DesignProcess />
      <div className="overflow-hidden bg-ink py-4 text-ink-foreground">
        <div className="flex w-max animate-marquee whitespace-nowrap font-display text-xl font-semibold uppercase">
          {Array.from({ length: 12 }).map((_, n) => (
            <span key={n} className="px-4">
              {c.marquee}
            </span>
          ))}
        </div>
      </div>
      <WorldShowcase
        title={c.livingTitle}
        subtitle={c.livingSubtitle}
        space={c.spaceShowcase}
        culture={c.cultureShowcase}
        spaceLabel={c.spaceLabel}
        cultureLabel={c.cultureLabel}
      />
      <InstagramStrip />
    </Page>
  );
}
