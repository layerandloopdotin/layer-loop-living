import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CenterRail } from "@/components/center-rail";
import { ProductCard } from "@/components/site";
import { Button } from "@/components/ui/button";
import type { World } from "@/lib/catalog";
import { img } from "@/lib/media";
import { useContent } from "@/lib/site";
import { setWorld, useWorld } from "@/lib/world";

/** Small SPACE | CULTURE pill. Switching changes colours and opens that world's landing. */
export function WorldSwitch({ compact = false }: { compact?: boolean }) {
  const world = useWorld();
  const navigate = useNavigate();
  const pick = (w: World) => { setWorld(w); navigator.vibrate?.(8); navigate({ to: w === "space" ? "/space" : "/culture" }); };
  const btn = (w: World, label: string) => (
    <button type="button" aria-pressed={world === w} onClick={() => pick(w)}
      className={`rounded-full px-3 py-1 font-display font-semibold uppercase tracking-widest transition-colors duration-300 ${compact ? "text-[10px]" : "text-[11px]"} ${world === w ? (w === "culture" ? "bg-pop-blue text-pop-blue-foreground" : "bg-ink-foreground text-ink") : "text-ink-muted hover:text-ink-foreground"}`}>
      {label}
    </button>
  );
  return <div role="group" aria-label="Choose a world" className="inline-flex items-center gap-0.5 rounded-full border border-ink-line p-0.5">{btn("space", "Space")}{btn("culture", "Culture")}</div>;
}

/** Image or looping video for a CMS media slot. */
export function Media({ image, video, alt, className = "" }: { image: string; video?: string; alt: string; className?: string }) {
  return video
    ? <video src={video} poster={img(image)} autoPlay muted loop playsInline aria-label={alt} className={className} />
    : <img src={img(image)} alt={alt} loading="lazy" className={className} />;
}

/** The hook slide: drag or move across to grow one world over the other. */
export function TwoWorlds() {
  const c = useContent("home");
  const navigate = useNavigate();
  const box = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [touched, setTouched] = useState(false);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    setSplit(Math.min(85, Math.max(15, ((clientX - r.left) / r.width) * 100)));
    setTouched(true);
  };
  useEffect(() => {
    if (touched || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t = 0; const id = setInterval(() => { t += 0.06; setSplit(50 + Math.sin(t) * 8); }, 50);
    return () => clearInterval(id);
  }, [touched]);
  const enter = (w: World) => { setWorld(w); navigate({ to: w === "space" ? "/space" : "/culture" }); };
  const side = split < 50 ? "culture" : "space";
  return (
    <div ref={box} onPointerMove={(e) => move(e.clientX)} onPointerDown={(e) => move(e.clientX)}
      className="relative h-full w-full touch-pan-y select-none overflow-hidden bg-ink" data-testid="two-worlds">
      <img src={img(c.spaceImage)} alt={c.spaceLabel} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
        <img src={img(c.cultureImage)} alt={c.cultureLabel} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-pop-blue/15 mix-blend-multiply" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-ink-foreground/90 shadow-[0_0_24px_var(--pop-orange)]" style={{ left: `${split}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink-foreground bg-ink/70 text-ink-foreground backdrop-blur"><ChevronLeft className="h-4 w-4" /><ChevronRight className="h-4 w-4" /></span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-ink/80 to-transparent px-6 pb-16 pt-8 text-center text-ink-foreground md:pt-12">
        <h1 className="whitespace-pre-line font-display text-3xl font-extrabold uppercase leading-[1.05] md:text-6xl">{c.worldsTitle}</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.3em] text-ink-foreground/80">{c.worldsHint}</p>
      </div>
      <button type="button" onClick={() => enter("space")} className={`absolute bottom-6 left-4 rounded-2xl bg-ink/75 px-4 py-3 text-left text-ink-foreground backdrop-blur transition-transform md:bottom-10 md:left-10 md:px-6 md:py-4 ${side === "space" ? "scale-105" : "opacity-80"}`}>
        <span className="block font-display text-xl font-extrabold uppercase md:text-3xl">{c.spaceLabel}</span>
        <span className="hidden text-xs text-ink-muted md:block">{c.spaceLine}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold">Enter <ArrowRight className="h-3 w-3" /></span>
      </button>
      <button type="button" onClick={() => enter("culture")} className={`absolute bottom-6 right-4 rounded-2xl bg-pop-blue px-4 py-3 text-right text-pop-blue-foreground transition-transform md:bottom-10 md:right-10 md:px-6 md:py-4 ${side === "culture" ? "scale-105 -rotate-2" : "opacity-80"}`}>
        <span className="block font-display text-xl font-extrabold uppercase md:text-3xl">{c.cultureLabel}</span>
        <span className="hidden text-xs opacity-80 md:block">{c.cultureLine}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold">Enter <ArrowRight className="h-3 w-3" /></span>
      </button>
    </div>
  );
}

type Slide = { eyebrow: string; title: string; text: string; image: string; button: string; link: string };

function SideSlide({ s, onClick }: { s: Slide; onClick?: () => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink text-ink-foreground">
      <img src={img(s.image)} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-16 md:px-12 md:pb-20">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{s.eyebrow}</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold uppercase leading-tight md:text-5xl">{s.title}</h2>
        <p className="mt-3 max-w-lg text-sm text-ink-foreground/80 md:text-base">{s.text}</p>
        {s.button && <Link to={(s.link || "/") as "/"} onClick={onClick} className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink-foreground px-5 py-2.5 text-sm font-semibold text-ink">{s.button} <ArrowRight className="h-4 w-4" /></Link>}
      </div>
    </div>
  );
}

/** Full-screen cover: side slide, the two-worlds hook in the middle, studio slide. Opens on the middle. */
export function CoverCarousel() {
  const c = useContent("home");
  const lead = c.coverSlides as Slide[];
  const studio: Slide = { eyebrow: c.studioEyebrow, title: c.studioTitle, text: c.studioText, image: c.studioImage, button: c.studioButton, link: "/" };
  const slides: ReactNode[] = [
    ...lead.map((s, n) => <SideSlide key={`a${n}`} s={s} onClick={() => { if (s.link === "/culture") setWorld("culture"); else if (s.link === "/space") setWorld("space"); }} />),
    <TwoWorlds key="w" />,
    <SideSlide key="b" s={studio} onClick={() => document.getElementById("studio-projects")?.scrollIntoView({ behavior: "smooth" })} />,
  ];
  const track = useRef<HTMLDivElement>(null);
  const start = lead.length;
  const [i, setI] = useState(start);
  useEffect(() => { const t = track.current; if (t) t.scrollLeft = start * t.clientWidth; }, [start]);
  const go = (n: number) => { const t = track.current; if (t) t.scrollTo({ left: n * t.clientWidth, behavior: "smooth" }); };
  return (
    <section className="relative">
      <div ref={track} onScroll={() => { const t = track.current; if (t) setI(Math.round(t.scrollLeft / t.clientWidth)); }}
        className="flex h-[78svh] min-h-[480px] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:h-[calc(100svh-72px)]">
        {slides.map((s, n) => <div key={n} className="h-full w-full shrink-0 snap-center">{s}</div>)}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Previous slide" onClick={() => go(Math.max(0, i - 1))} className="pointer-events-auto hidden h-8 w-8 rounded-full bg-ink/60 text-ink-foreground md:inline-flex"><ChevronLeft className="h-4 w-4" /></Button>
        {slides.map((_, n) => <button key={n} type="button" aria-label={`Slide ${n + 1}`} onClick={() => go(n)} className={`pointer-events-auto h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-ink-foreground" : "w-1.5 bg-ink-foreground/50"}`} />)}
        <Button variant="ghost" size="icon" aria-label="Next slide" onClick={() => go(Math.min(slides.length - 1, i + 1))} className="pointer-events-auto hidden h-8 w-8 rounded-full bg-ink/60 text-ink-foreground md:inline-flex"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </section>
  );
}

/** Two big panels: Space on the left, Culture on the right. */
export function WorldPanels() {
  const c = useContent("home");
  const panel = (w: World, label: string, line: string, image: string) => (
    <Link to={w === "space" ? "/space" : "/culture"} onClick={() => setWorld(w)} className="group relative block overflow-hidden rounded-2xl">
      <img src={img(image)} alt={label} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] md:aspect-[5/6]" />
      <div className={`absolute inset-0 ${w === "culture" ? "bg-gradient-to-t from-pop-blue/80 to-transparent" : "bg-gradient-to-t from-ink/80 to-transparent"}`} />
      <div className={`absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 ${w === "culture" ? "text-pop-blue-foreground" : "text-ink-foreground"}`}>
        <div><p className="font-display text-3xl font-extrabold uppercase md:text-5xl">{label}</p><p className="mt-1 text-sm opacity-85">{line}</p></div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${w === "culture" ? "bg-pop-orange text-foreground" : "bg-ink-foreground text-ink"}`}><ArrowRight className="h-5 w-5" /></span>
      </div>
    </Link>
  );
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
      <h2 className="text-3xl font-extrabold uppercase md:text-4xl">{c.chooseTitle}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{c.chooseSubtitle}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
        {panel("space", c.spaceLabel, c.spaceLine, c.spaceImage)}
        {panel("culture", c.cultureLabel, c.cultureLine, c.cultureImage)}
      </div>
    </section>
  );
}

export function StudioProjects() {
  const c = useContent("home");
  return (
    <section id="studio-projects" className="bg-ink py-14 text-ink-foreground md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-3xl font-extrabold uppercase md:text-4xl">{c.projectsTitle}</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">{c.projectsSubtitle}</p>
        <CenterRail dark className="-mx-4 mt-8 md:-mx-6" itemClass="w-[78%] md:w-[44%] lg:w-[34%]" edgeClass="w-[11%] md:w-[28%] lg:w-[33%]" start={0}>
          {c.projects.map((p) => (
            <div key={p.name}>
              <Media image={p.image} video={p.video} alt={p.name} className="aspect-[4/5] w-full rounded-2xl object-cover" />
              <p className="mt-4 font-display text-lg font-semibold">{p.name}</p>
              <p className="mt-1 text-sm text-ink-muted">{p.text}</p>
            </div>
          ))}
        </CenterRail>
      </div>
    </section>
  );
}

/** One combined section: the six making steps, each with its scale note. Used on home and About. */
export function DesignProcess() {
  const c = useContent("home");
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
      <h2 className="text-3xl font-extrabold uppercase md:text-4xl">{c.processTitle}</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{c.processSubtitle}</p>
      <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] md:-mx-6 md:px-6">
        {c.process.map((s, n) => (
          <article key={s.name} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[30%]">
            <div className="relative overflow-hidden rounded-2xl">
              <Media image={s.image} video={s.video} alt={s.name} className="aspect-[4/3] w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-background px-3 py-1 font-display text-xs font-bold">{String(n + 1).padStart(2, "0")}</span>
              {s.scale && <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1 text-[11px] text-ink-foreground backdrop-blur">{s.scale}</span>}
            </div>
            <p className="mt-4 font-display text-lg font-semibold">{s.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SetupsGallery({ title, subtitle, space, culture }: { title: string; subtitle?: string; space: string[]; culture: string[] }) {
  const tile = (src: string, w: World, n: number) => (
    <div key={w + n} className="relative overflow-hidden rounded-2xl">
      <img src={img(src)} alt={`${w === "space" ? "Space room" : "Culture setup"} ${n + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${w === "culture" ? "bg-pop-orange text-foreground" : "bg-background text-foreground"}`}>{w}</span>
    </div>
  );
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
      <h2 className="mx-auto max-w-xl text-center text-3xl font-bold md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="grid gap-4">{space.slice(0, 2).map((s, n) => tile(s, "space", n))}</div>
        <div className="grid gap-4">{culture.slice(0, 2).map((s, n) => tile(s, "culture", n))}</div>
      </div>
    </section>
  );
}

export function ProductRail({ products, tag }: { products: { slug: string; name: string; note: string; price: number; image: string }[]; tag?: string }) {
  return (
    <CenterRail className="-mx-4 mt-6 md:-mx-6 md:mt-10" itemClass="w-[70%] md:w-[40%] lg:w-[32%]" edgeClass="w-[15%] md:w-[30%] lg:w-[34%]" start={0}>
      {products.map((p) => (
        <div key={p.slug} className="relative">
          {tag && <span className="absolute left-3 top-3 z-10 -rotate-3 rounded-md bg-pop-orange px-2.5 py-1 text-[11px] font-extrabold uppercase text-foreground">{tag}</span>}
          <ProductCard slug={p.slug} name={p.name} note={p.note} price={p.price} image={p.image} />
        </div>
      ))}
    </CenterRail>
  );
}
