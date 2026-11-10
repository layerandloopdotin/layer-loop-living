import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, Droplets, Lightbulb, Minus, Plus, Shuffle, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fieldValue } from "@/lib/contact";
import {
  BRIEF_KINDS, DEFAULT_DESIGN, FORMS, STUDIO_PALETTE, TIMELINES, briefSchema, closestSwatches, estimate, wallLoops, type Design, type Rates,
} from "@/lib/custom";
import { formatPrice } from "@/lib/currency";
import { img } from "@/lib/media";
import { useSite, waHref } from "@/lib/site";
import { Page } from "@/components/site";

const StudioModel = lazy(() => import("@/components/custom/studio-3d").then((m) => ({ default: m.StudioModel })));
const PhotoRelief = lazy(() => import("@/components/custom/studio-3d").then((m) => ({ default: m.PhotoRelief })));

export const Route = createFileRoute("/custom")({
  head: () => ({
    meta: [
      { title: "Custom & Bespoke 3D Printing — Layer & Loop" },
      { name: "description", content: "Design your own 3D printed lamp, vase or stackable piece: engraving, any colour, custom scale, fuzzy skin texture and photo-to-3D." },
      { property: "og:title", content: "The Bespoke Lab — Custom 3D Printed Objects by Layer & Loop" },
      { property: "og:description", content: "Play with a live 3D sandbox, then send your custom brief to our studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Custom,
});

const Loading = () => <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-ink-muted">Warming up the printer…</div>;
const Three = ({ children }: { children: ReactNode }) => <ClientOnly fallback={<Loading />}><Suspense fallback={<Loading />}>{children}</Suspense></ClientOnly>;

/** Fades children up the first time they scroll into view. */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>{children}</div>;
}

const eyebrow = "text-xs font-bold uppercase tracking-widest text-primary";

function Custom() {
  const site = useSite();
  const c = site.content("custom");
  const st = site.content("settings");
  const rates: Rates = {
    gramPrice: Number(c.gramPrice) || 6, base: Number(c.basePrice) || 900,
    lightKit: Number(c.lightKitPrice) || 1200, waterproofLoops: Number(c.waterproofLoops) || 3,
  };
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN);
  const [sentDesign, setSentDesign] = useState<Design | null>(null);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <Page>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <p className={eyebrow}>{c.heroEyebrow}</p>
            <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl" aria-label={c.heroTitle}>
              {c.heroTitle.split(" ").map((word, w, all) => (
                <span key={w} aria-hidden className="inline-block whitespace-nowrap">
                  {word.split("").map((ch, i) => {
                    const n = all.slice(0, w).join("").length + w + i;
                    return <span key={i} className="layer-in inline-block" style={{ animationDelay: `${n * 55}ms` }}>{ch}</span>;
                  })}
                  {w < all.length - 1 && "\u00a0"}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-muted">{c.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => go("sandbox")} className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">
                {c.tweakLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={() => go("brief")} className="rounded-full border border-ink-line px-6 py-3 text-sm font-semibold transition-colors hover:border-ink-foreground">{c.scratchLabel}</button>
            </div>
          </div>
          <div className="h-[380px] md:h-[520px]">
            <Three><StudioModel design={{ ...DEFAULT_DESIGN, form: "stack", stack: 3, height: 14, width: 16, layers: 34 }} spin interactive={false} /></Three>
          </div>
        </div>
      </section>

      {/* What we customise */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Reveal><h2 className="font-display text-3xl font-bold md:text-5xl">{c.offersTitle}</h2></Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {c.offers.map((o, i) => (
              <Reveal key={o.name} delay={i * 90}>
                <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <div className="mb-5 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-muted"><OfferDemo i={i} onPhoto={() => go("photo")} /></div>
                  <h3 className="font-display text-lg font-bold">{o.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{o.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sandbox */}
      <section id="sandbox" className="scroll-mt-20 bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Reveal>
            <p className={eyebrow}>{c.sandboxEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">{c.sandboxTitle}</h2>
            <p className="mt-3 max-w-xl text-ink-muted">{c.sandboxText}</p>
          </Reveal>
          <Sandbox design={design} setDesign={setDesign} rates={rates} note={c.sandboxNote} sendLabel={c.sendLabel}
            onSend={() => { setSentDesign(design); go("brief"); toast.success("Design attached to your brief"); }} />
        </div>
      </section>

      {/* Photo to 3D */}
      <section id="photo" className="scroll-mt-20 bg-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <Reveal>
            <p className={eyebrow}>{c.photoEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">{c.photoTitle}</h2>
            <p className="mt-4 max-w-md text-muted-foreground">{c.photoText}</p>
            <p className="mt-4 text-xs text-muted-foreground">{c.photoNote}</p>
          </Reveal>
          <PhotoLab color={design.color} />
        </div>
      </section>

      {/* Sketch to print */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <p className={eyebrow}>{c.sketchEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{c.sketchTitle}</h2>
          </Reveal>
          <Reveal delay={150}><BeforeAfter before={img(c.sketchImage)} after={img(c.printImage)} /></Reveal>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Reveal><h2 className="font-display text-3xl font-bold md:text-5xl">{c.stepsTitle}</h2></Reveal>
          <ol className="relative mt-12 grid gap-8 md:grid-cols-4">
            <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block" />
            {c.steps.map((s, i) => (
              <Reveal key={s.name} delay={i * 150}>
                <li className="relative">
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">{i + 1}</span>
                  <h3 className="mt-5 font-display text-xl font-bold">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Brief */}
      <section id="brief" className="scroll-mt-20 bg-muted/40">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <Reveal>
            <p className={eyebrow}>{c.briefEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">{c.briefTitle}</h2>
            <p className="mt-3 text-muted-foreground">{c.briefText}</p>
          </Reveal>
          <Brief design={sentDesign} clearDesign={() => setSentDesign(null)} rates={rates} submitLabel={c.submitLabel} thankYou={c.thankYou} />
          <a href={waHref(st.whatsapp, "Hi Layer & Loop, I have a custom idea…")} target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm underline underline-offset-4">{c.whatsappLabel}</a>
        </div>
      </section>
    </Page>
  );
}

/* ---------- Mini demos ---------- */

function OfferDemo({ i, onPhoto }: { i: number; onPhoto: () => void }) {
  const [text, setText] = useState("Aarav");
  const [hex, setHex] = useState("#2f7d6d");
  const [scale, setScale] = useState(1);
  const [stack, setStack] = useState(3);
  if (i === 0) return (
    <div className="flex w-full flex-col items-center gap-3 px-3">
      <div className="flex h-16 w-28 items-center justify-center rounded-t-[40px] rounded-b-md bg-[repeating-linear-gradient(0deg,var(--color-border)_0_2px,transparent_2px_5px)] bg-card shadow-inner">
        <span className="max-w-24 truncate font-display text-sm font-bold tracking-wider text-muted-foreground [text-shadow:0_1px_0_var(--color-background)]">{text || "…"}</span>
      </div>
      <input value={text} maxLength={14} onChange={(e) => setText(e.target.value)} aria-label="Engraving text" className="w-full rounded-md border border-border bg-background px-2 py-1 text-center text-xs" />
    </div>
  );
  if (i === 1) {
    const near = closestSwatches(hex, STUDIO_PALETTE, 3);
    return (
      <div className="flex flex-col items-center gap-2">
        <label className="flex items-center gap-2 text-xs"><input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent" aria-label="Pick any colour" />{hex}</label>
        <div className="flex gap-1.5">{near.map((s) => <span key={s.hex} title={s.name} className="h-7 w-7 rounded-full border border-border transition-transform hover:scale-125" style={{ background: s.hex }} />)}</div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Closest: {near[0]?.name}</span>
      </div>
    );
  }
  if (i === 2) return (
    <div className="flex w-full flex-col items-center gap-2 px-3">
      <div className="flex h-24 items-end gap-3">
        <div className="rounded-t-full bg-primary transition-all duration-300" style={{ width: 22 * scale, height: 40 * scale }} />
        <div className="h-8 w-7 rounded-b-md border-2 border-muted-foreground/50" title="Coffee cup" />
      </div>
      <input type="range" min={0.6} max={2.2} step={0.05} value={scale} onChange={(e) => setScale(+e.target.value)} aria-label="Scale" className="w-full accent-primary" />
    </div>
  );
  if (i === 3) return (
    <button type="button" onClick={onPhoto} className="flex flex-col items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
      <Upload className="h-8 w-8 animate-bounce" /> Try it with your photo
    </button>
  );
  return (
    <div className="flex items-center gap-4">
      <button type="button" aria-label="Remove a module" onClick={() => setStack((s) => Math.max(1, s - 1))} className="rounded-full border border-border p-1"><Minus className="h-3 w-3" /></button>
      <div className="flex flex-col-reverse items-center">
        {Array.from({ length: stack }).map((_, k) => <span key={k} className="layer-in -mt-0.5 block h-5 w-12 rounded-[40%] bg-primary/80 shadow" style={{ opacity: 1 - k * 0.08 }} />)}
      </div>
      <button type="button" aria-label="Add a module" onClick={() => setStack((s) => Math.min(5, s + 1))} className="rounded-full border border-border p-1"><Plus className="h-3 w-3" /></button>
    </div>
  );
}

/* ---------- Sandbox ---------- */

function Slider({ label, value, min, max, step, onChange, show }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs uppercase tracking-widest text-ink-muted"><span>{label}</span><span className="text-ink-foreground">{show}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-2 w-full accent-primary" />
    </label>
  );
}

function Toggle({ on, onClick, icon, label, disabled }: { on: boolean; onClick: () => void; icon: ReactNode; label: string; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all disabled:opacity-30 ${on ? "border-primary bg-primary text-primary-foreground" : "border-ink-line hover:border-ink-foreground"}`}>
      {icon}{label}
    </button>
  );
}

function Sandbox({ design: d, setDesign, rates, note, sendLabel, onSend }: { design: Design; setDesign: (d: Design) => void; rates: Rates; note: string; sendLabel: string; onSend: () => void }) {
  const set = (p: Partial<Design>) => setDesign({ ...d, ...p });
  const spec = estimate(d, rates);
  const form = FORMS.find((f) => f.id === d.form)!;
  const [hexInput, setHexInput] = useState(d.color);
  const near = closestSwatches(d.color, STUDIO_PALETTE, 1)[0];
  const shuffle = () => set({
    taper: +(Math.random() * 1.4 - 0.7).toFixed(2), twist: +Math.random().toFixed(2), fuzzy: +Math.random().toFixed(2),
    layers: 8 + Math.round(Math.random() * 50), color: STUDIO_PALETTE[Math.floor(Math.random() * STUDIO_PALETTE.length)]?.hex ?? d.color,
  });
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr_0.9fr]">
      <div className="space-y-5 rounded-2xl border border-ink-line p-5">
        <div className="flex flex-wrap gap-2">
          {FORMS.map((f) => (
            <button key={f.id} type="button" aria-pressed={d.form === f.id} onClick={() => set({ form: f.id, stack: f.id === "stack" && d.stack < 2 ? 3 : d.stack, light: f.light ? d.light : false, waterproof: f.water ? d.waterproof : false })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${d.form === f.id ? "bg-ink-foreground text-ink" : "border border-ink-line text-ink-muted hover:text-ink-foreground"}`}>{f.label}</button>
          ))}
        </div>
        <Slider label={d.form === "stack" ? "Module height" : "Height"} value={d.height} min={8} max={45} step={1} onChange={(v) => set({ height: v })} show={`${d.height} cm`} />
        <Slider label="Width" value={d.width} min={8} max={40} step={1} onChange={(v) => set({ width: v })} show={`${d.width} cm`} />
        <Slider label="Taper" value={d.taper} min={-0.7} max={0.7} step={0.01} onChange={(v) => set({ taper: v })} show={d.taper.toFixed(2)} />
        <Slider label="Twist" value={d.twist} min={0} max={1} step={0.01} onChange={(v) => set({ twist: v })} show={`${Math.round(d.twist * 100)}%`} />
        <Slider label="Fuzzy skin" value={d.fuzzy} min={0} max={1} step={0.01} onChange={(v) => set({ fuzzy: v })} show={d.fuzzy < 0.05 ? "Off" : d.fuzzy < 0.4 ? "Soft" : d.fuzzy < 0.75 ? "Medium" : "Heavy"} />
        <Slider label="Ribs" value={d.layers} min={0} max={60} step={1} onChange={(v) => set({ layers: v })} show={String(d.layers)} />
        {d.form === "stack" && <Slider label="Stack" value={d.stack} min={1} max={6} step={1} onChange={(v) => set({ stack: v })} show={`${d.stack} module${d.stack > 1 ? "s" : ""}`} />}
      </div>

      <div className="relative h-[460px] overflow-hidden rounded-2xl bg-ink-soft lg:h-auto lg:min-h-[560px]">
        <Three><StudioModel design={d} /></Three>
        <button type="button" onClick={shuffle} className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-transform hover:rotate-3 hover:scale-105"><Shuffle className="h-3.5 w-3.5" /> Surprise me</button>
        <p className="pointer-events-none absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-ink-muted">Drag to spin · scroll to zoom</p>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-ink-line p-5">
          <p className="text-xs uppercase tracking-widest text-ink-muted">Colour</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STUDIO_PALETTE.map((s) => (
              <button key={s.hex} type="button" title={s.name} aria-label={s.name} onClick={() => { set({ color: s.hex }); setHexInput(s.hex); }}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-115 ${d.color === s.hex ? "scale-110 border-primary" : "border-ink-line"}`} style={{ background: s.hex }} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input type="color" value={d.color} onChange={(e) => { set({ color: e.target.value }); setHexInput(e.target.value); }} aria-label="Any colour" className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent" />
            <input value={hexInput} onChange={(e) => { setHexInput(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) set({ color: e.target.value }); }} aria-label="Hex code"
              className="w-28 rounded-md border border-ink-line bg-transparent px-2 py-1.5 font-mono text-xs" />
          </div>
          {near && <p className="mt-2 text-xs text-ink-muted">Closest studio match: <span className="inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: near.hex }} /> <span className="text-ink-foreground">{near.name}</span></p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Toggle on={d.light} disabled={!form.light} onClick={() => set({ light: !d.light })} icon={<Lightbulb className="h-3.5 w-3.5" />} label={d.light ? "Light on" : "Light off"} />
            {d.light && form.light && <Toggle on={d.warm} onClick={() => set({ warm: !d.warm })} icon={null} label={d.warm ? "Warm 2200K" : "Soft 3000K"} />}
            <Toggle on={d.waterproof} disabled={!form.water} onClick={() => set({ waterproof: !d.waterproof })} icon={<Droplets className="h-3.5 w-3.5" />} label="Waterproof" />
          </div>
          {d.waterproof && <p className="mt-2 text-xs text-ink-muted">Adds {rates.waterproofLoops} extra wall loops ({wallLoops(d, rates)} total) — heavier, but holds water.</p>}
        </div>

        <div className="rounded-2xl bg-ink-foreground p-5 text-ink">
          <p className="text-xs uppercase tracking-widest opacity-60">Live estimate</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{formatPrice(spec.low)} – {formatPrice(spec.high)}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs opacity-60">Size</dt><dd className="font-semibold tabular-nums">{spec.totalHeight} × {spec.width} cm</dd></div>
            <div><dt className="text-xs opacity-60">Weight</dt><dd className="font-semibold tabular-nums">~{spec.grams} g</dd></div>
            <div><dt className="text-xs opacity-60">Print time</dt><dd className="font-semibold tabular-nums">~{spec.hours} h</dd></div>
            <div><dt className="text-xs opacity-60">Walls</dt><dd className="font-semibold tabular-nums">{spec.loops} loops</dd></div>
          </dl>
          <p className="mt-4 text-[11px] opacity-60">{note}</p>
          <button type="button" onClick={onSend} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">{sendLabel} <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Photo to 3D ---------- */

function PhotoLab({ color }: { color: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [depth, setDepth] = useState(0.5);
  const [tinted, setTinted] = useState(false);
  const [drag, setDrag] = useState(false);
  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);
  const take = (f?: File) => { if (f && f.type.startsWith("image/")) setSrc(URL.createObjectURL(f)); };
  return (
    <div>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
        className={`relative h-[380px] overflow-hidden rounded-2xl border-2 border-dashed bg-ink transition-colors ${drag ? "border-primary" : "border-border"}`}>
        {src ? <Three><PhotoRelief src={src} depth={depth} color={color} tinted={tinted} /></Three> : (
          <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-3 text-ink-muted transition-colors hover:text-ink-foreground">
            <Upload className="h-10 w-10" />
            <span className="text-sm font-semibold">Drop a photo or tap to upload</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => take(e.target.files?.[0])} />
          </label>
        )}
      </div>
      {src && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex flex-1 items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">Depth
            <input type="range" min={0.1} max={1.2} step={0.05} value={depth} onChange={(e) => setDepth(+e.target.value)} className="flex-1 accent-primary" />
          </label>
          <button type="button" onClick={() => setTinted(!tinted)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">{tinted ? "Show photo colours" : "Tint with sandbox colour"}</button>
          <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold">Change photo<input type="file" accept="image/*" className="sr-only" onChange={(e) => take(e.target.files?.[0])} /></label>
        </div>
      )}
    </div>
  );
}

/* ---------- Before / after ---------- */

function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const move = (x: number) => { const r = ref.current!.getBoundingClientRect(); setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))); };
  return (
    <div ref={ref} className="relative mt-10 aspect-[4/3] cursor-ew-resize select-none overflow-hidden rounded-2xl touch-none"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => { if (e.buttons) move(e.clientX); }}>
      <img src={after} alt="Finished 3D printed piece" loading="lazy" width={1200} height={912} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <img src={before} alt="Original design sketch" loading="lazy" width={1200} height={912} className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} draggable={false} />
      <div className="absolute inset-y-0 w-0.5 bg-ink-foreground" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink-foreground text-xs font-bold text-ink shadow-lg">⇆</span>
      </div>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Compare sketch and finished piece" className="sr-only" />
      <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs text-ink-foreground">Sketch</span>
      <span className="absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs text-ink-foreground">Printed</span>
    </div>
  );
}

/* ---------- Brief ---------- */

const field = "mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground";
const lbl = "block text-xs uppercase tracking-widest text-muted-foreground";
const STEP_FIELDS = [["kind", "idea"], ["size", "color", "engraving", "quantity", "timeline"], ["name", "email", "phone", "pincode"]];

function designSummary(d: Design, rates: Rates) {
  const s = estimate(d, rates);
  return `${FORMS.find((f) => f.id === d.form)!.label} · ${s.totalHeight}×${s.width} cm · fuzzy ${Math.round(d.fuzzy * 100)}% · ${d.layers} ribs · twist ${Math.round(d.twist * 100)}% · taper ${d.taper} · ${d.color}${d.light ? ` · light ${d.warm ? "warm" : "soft"}` : ""}${d.waterproof ? " · waterproof" : ""}${d.form === "stack" ? ` · ${s.modules} modules` : ""} · est. ₹${s.low}–${s.high}`;
}

function Brief({ design, clearDesign, rates, submitLabel, thankYou }: { design: Design | null; clearDesign: () => void; rates: Rates; submitLabel: string; thankYou: string }) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const summary = useMemo(() => (design ? designSummary(design, rates) : ""), [design, rates]);

  const values = () => {
    const f = new FormData(formRef.current!);
    const v = (k: string) => fieldValue(f, k);
    return {
      kind: v("kind"), idea: v("idea"), size: v("size") || undefined, color: v("color") || undefined, engraving: v("engraving") || undefined,
      quantity: v("quantity") || "1", timeline: v("timeline"), name: v("name"), email: v("email"), phone: v("phone"), pincode: v("pincode"),
    };
  };
  const check = (upTo: number) => {
    const r = briefSchema.safeParse(values());
    const keys = STEP_FIELDS.slice(0, upTo + 1).flat();
    const errs: Record<string, string> = {};
    if (!r.success) r.error.issues.forEach((i) => { const k = String(i.path[0]); if (keys.includes(k)) errs[k] ??= i.message; });
    setErrors(errs);
    return { ok: !Object.keys(errs).length, r };
  };
  const next = () => { if (check(step).ok) setStep(step + 1); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ok, r } = check(2);
    if (!ok || !r.success) {
      const bad = r.success ? [] : r.error.issues.map((i) => String(i.path[0]));
      const first = STEP_FIELDS.findIndex((keys) => keys.some((k) => bad.includes(k)));
      if (first >= 0) setStep(first);
      return;
    }
    setBusy(true);
    const paths: string[] = [];
    for (const file of files) {
      const path = `briefs/${crypto.randomUUID()}/${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("custom-briefs").upload(path, file);
      if (!error) paths.push(path);
    }
    const { error } = await supabase.from("submissions").insert({ kind: "custom", data: { ...r.data, ...(summary ? { design: summary } : {}), ...(paths.length ? { files: paths } : {}) } });
    setBusy(false);
    if (error) { toast.error("Couldn't send your brief — please try again or WhatsApp us."); return; }
    if (paths.length < files.length) toast.warning("Some files couldn't upload — you can share them with us later.");
    setSent(true);
  };

  if (sent) return (
    <div className="mt-10 flex flex-col items-center rounded-2xl bg-card p-10 text-center shadow-sm">
      <div className="flex flex-col-reverse">{[0, 1, 2, 3, 4].map((k) => <span key={k} className="layer-in -mt-1 block h-4 w-16 rounded-full bg-primary" style={{ animationDelay: `${k * 180}ms`, width: 64 - k * 8 }} />)}</div>
      <Check className="mt-6 h-8 w-8 text-primary" />
      <p className="mt-3 max-w-md text-lg">{thankYou}</p>
    </div>
  );

  const err = (k: string) => errors[k] && <span className="mt-1 block text-[11px] normal-case tracking-normal text-destructive">{errors[k]}</span>;
  return (
    <form ref={formRef} onSubmit={submit} noValidate className="mt-10 rounded-2xl bg-card p-6 shadow-sm md:p-8">
      <div className="mb-8 flex gap-2">{["The idea", "The details", "You"].map((s, i) => (
        <button key={s} type="button" onClick={() => i < step && setStep(i)} className="flex-1 text-left">
          <span className={`block h-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-primary" : "bg-border"}`} />
          <span className={`mt-2 block text-xs uppercase tracking-widest ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
        </button>
      ))}</div>

      {design && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm">
          <span className="mt-1 h-4 w-4 shrink-0 rounded-full" style={{ background: design.color }} />
          <p className="flex-1"><span className="font-semibold">Sandbox design attached:</span> {summary}</p>
          <button type="button" onClick={clearDesign} className="text-xs underline">Remove</button>
        </div>
      )}

      <div className={step === 0 ? "space-y-5" : "hidden"}>
        <fieldset>
          <legend className={lbl}>What would you like made?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {BRIEF_KINDS.map((k, i) => (
              <label key={k} className="cursor-pointer">
                <input type="radio" name="kind" value={k} defaultChecked={!!design && i === 0} className="peer sr-only" />
                <span className="inline-block rounded-full border border-border px-4 py-2 text-sm transition-all peer-checked:scale-105 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground hover:border-foreground">{k}</span>
              </label>
            ))}
          </div>
          {err("kind")}
        </fieldset>
        <label className={lbl}>Describe your idea<textarea name="idea" rows={4} className={field} placeholder="A tall stacked floor lamp for our café corner, soft sage, fuzzy texture…" />{err("idea")}</label>
        <div>
          <span className={lbl}>Sketches, photos or 3D files (optional)</span>
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-6 text-sm text-muted-foreground hover:border-foreground">
            <Upload className="h-4 w-4" /> {files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Choose files — images, PDF, STL, OBJ, STEP (up to 20 MB each)"}
            <input type="file" multiple accept="image/*,.pdf,.stl,.obj,.step,.stp,.3mf" className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []).filter((f) => f.size <= 20 * 1024 * 1024).slice(0, 6))} />
          </label>
        </div>
      </div>

      <div className={step === 1 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
        <label className={lbl}>Size or scale<input name="size" className={field} placeholder="e.g. 120 cm tall, or 2× the Terra" />{err("size")}</label>
        <label className={lbl}>Colour / hex / palette<input name="color" defaultValue={design?.color ?? ""} className={field} placeholder="#8f9f84 or 'warm sand'" />{err("color")}</label>
        <label className={lbl}>Engraving (optional)<input name="engraving" maxLength={60} className={field} placeholder="Names, initials, a date…" />{err("engraving")}</label>
        <label className={lbl}>Quantity<input name="quantity" type="number" min={1} defaultValue={1} className={field} />{err("quantity")}</label>
        <label className={`${lbl} sm:col-span-2`}>Timeline
          <select name="timeline" defaultValue="" className={field}><option value="" disabled>Choose one</option>{TIMELINES.map((t) => <option key={t}>{t}</option>)}</select>{err("timeline")}
        </label>
      </div>

      <div className={step === 2 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>
        <label className={lbl}>Name<input name="name" autoComplete="name" className={field} />{err("name")}</label>
        <label className={lbl}>Email<input name="email" type="email" autoComplete="email" className={field} />{err("email")}</label>
        <label className={lbl}>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" className={field} />{err("phone")}</label>
        <label className={lbl}>Delivery PIN code<input name="pincode" inputMode="numeric" maxLength={6} className={field} />{err("pincode")}</label>
      </div>

      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="text-sm underline underline-offset-4">Back</button> : <span />}
        {step < 2
          ? <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">Next <ArrowRight className="h-4 w-4" /></button>
          : <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Sending…" : submitLabel}</button>}
      </div>
    </form>
  );
}
