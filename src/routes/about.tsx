import { createFileRoute } from "@tanstack/react-router";
import { DarkHero, Page } from "@/components/site";
import craft from "@/assets/craft.jpg";
import stoneware from "@/assets/stoneware.jpg";
import glass from "@/assets/glass.jpg";
import brass from "@/assets/brass.jpg";
import study from "@/assets/study.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Layer & Loop" },
      { name: "description", content: "Atmosphere, material and form: how Layer & Loop crafts lighting meant to be lived with." },
      { property: "og:title", content: "Our Story — Layer & Loop" },
      { property: "og:description", content: "Objects that feel lived with, not just observed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const mats = [
  { name: "Coarse Stoneware", text: "Unglazed raw surfaces preserving earth mineral pigments.", img: stoneware },
  { name: "Hand-Blown Glass", text: "Each shade features slight ripples and organic variations.", img: glass },
  { name: "Patinated Brass", text: "Solid weighted bases designed to oxidize gracefully over years.", img: brass },
];

function About() {
  return (
    <Page>
      <DarkHero eyebrow="Our Story" title="Atmosphere. Material. Form." />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">We believe objects should feel lived with, not just observed.</h2>
          <p className="mt-5 text-muted-foreground">LAYER &amp; LOOP was founded in 2022 to bridge the gap between contemporary sculptural lighting and quiet, warm functional comfort. By working directly with select ceramic studios and glassmakers, we build lighting that honors its elemental materials—clay, stone, glass, and heavy solid brass.</p>
        </div>
        <img src={craft} alt="Hands shaping a clay vase" loading="lazy" width={1024} height={768} className="rounded-2xl" />
      </section>
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold">Honoring Elemental Materials</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {mats.map((m) => (
              <div key={m.name} className="rounded-2xl bg-ink-soft p-5">
                <img src={m.img} alt={m.name} loading="lazy" className="aspect-[3/1.2] w-full rounded-lg object-cover" />
                <h3 className="mt-5 font-bold">{m.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold uppercase">Designed for Atmosphere</h2>
        <img src={study} alt="Warm study lit at dusk" loading="lazy" width={1600} height={768} className="mt-10 w-full rounded-2xl" />
      </section>
    </Page>
  );
}
