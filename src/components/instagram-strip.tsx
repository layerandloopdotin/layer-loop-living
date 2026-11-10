import { Instagram } from "lucide-react";
import { useContent } from "@/lib/site";
import { img } from "@/lib/media";
import { CenterRail } from "@/components/center-rail";

export function InstagramStrip() {
  const c = useContent("instagram");
  return (
    <section className="bg-ink py-16 text-ink-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] opacity-60">{c.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold">@{c.handle}</h2>
          <p className="mt-2 max-w-md text-sm opacity-70">{c.text}</p>
        </div>
        <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-current px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70">
          <Instagram className="h-4 w-4" /> {c.buttonLabel}
        </a>
      </div>
      <CenterRail dark className="mt-8" itemClass="w-[60%] sm:w-64">
        {c.posts.map((src, n) => (
          <a key={n} href={c.url} target="_blank" rel="noreferrer" aria-label={`Instagram post ${n + 1}`}
            className="group relative block aspect-square overflow-hidden rounded-xl">
            <img src={img(src)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
              <Instagram className="h-6 w-6" />
            </span>
          </a>
        ))}
      </CenterRail>
    </section>
  );
}
