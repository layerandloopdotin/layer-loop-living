import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, ChevronUp, Copy, Droplets, Eraser, GripVertical, Lightbulb, Minus, PencilLine, Plus, Shuffle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fieldValue } from "@/lib/contact";
import {
  BRIEF_KINDS, CUSTOM_MODULE, DEFAULT_DESIGN, FORMS, MAX_MODULES, MAX_POINTS, PHOTO_MODES, POINT_PRESETS, SHAPES, STUDIO_PALETTE, TIMELINES, briefSchema, closestSwatches, estimate,
  hexToRgb, lightFitting, rgbToHex, sketchProfile, wallLoops, type Design, type PhotoMode, type PhotoObject, type Rates, type ShapeId, type StackModule, type TouchPoint,
} from "@/lib/custom";
import { formatPrice } from "@/lib/currency";
import { img } from "@/lib/media";
import { useSite, waHref } from "@/lib/site";
import { Page } from "@/components/site";
import heroFallback from "@/assets/custom-hero.jpg";
import { HexColorPicker } from "react-colorful";
import { analyzeObjectPhoto } from "@/lib/photo-object.functions";

const StudioModel = lazy(() => import("@/components/custom/studio-3d").then((m) => ({ default: m.StudioModel })));
const SketchModel = lazy(() => import("@/components/custom/studio-3d").then((m) => ({ default: m.SketchModel })));
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
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img src={img(c.heroImage) || heroFallback} alt="" width={1920} height={1088} className="custom-hero-img absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/10 md:via-ink/60 md:to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 pt-28 md:min-h-[88vh] md:items-center md:pb-24">
          <div className="max-w-2xl">
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
        </div>
      </section>

      {/* What we customise */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Reveal><h2 className="font-display text-3xl font-bold md:text-5xl">{c.offersTitle}</h2></Reveal>
          <div className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0 lg:gap-4">
            {c.offers.map((o, i) => (
              <Reveal key={o.name} delay={i * 90} className="w-64 shrink-0 snap-center md:w-auto">
                <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl lg:p-5">
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
          <Reveal delay={150}><SketchLab before={img(c.sketchImage)} after={img(c.printImage)} color={design.color} /></Reveal>
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
        <label className="flex items-center gap-2 text-xs"><input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent" aria-label="Pick your colour" />Pick yours</label>
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

function ColorPanel({ value, onChange, label }: { value: string; onChange: (hex: string) => void; label?: string }) {
  const [hexInput, setHexInput] = useState(value);
  useEffect(() => setHexInput(value), [value]);
  const rgb = hexToRgb(value) ?? [0, 0, 0];
  const near = closestSwatches(value, STUDIO_PALETTE, 1)[0];
  return (
    <div>
      {label && <p className="mb-2 text-xs uppercase tracking-widest text-ink-muted">{label}</p>}
      <div className="studio-picker"><HexColorPicker color={value} onChange={onChange} /></div>
      <div className="mt-3 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-2">
        <label className="text-[10px] uppercase tracking-widest text-ink-muted">Hex
          <input value={hexInput} aria-label="Hex code" onChange={(e) => { setHexInput(e.target.value); const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`; if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase()); }}
            className="mt-1 w-full rounded-md border border-ink-line bg-transparent px-2 py-1.5 font-mono text-xs normal-case text-ink-foreground" />
        </label>
        {(["R", "G", "B"] as const).map((ch, k) => (
          <label key={ch} className="text-[10px] uppercase tracking-widest text-ink-muted">{ch}
            <input type="number" min={0} max={255} value={rgb[k]} aria-label={`${ch} value`}
              onChange={(e) => { const n = [...rgb] as [number, number, number]; n[k] = +e.target.value; onChange(rgbToHex(...n)); }}
              className="mt-1 w-full rounded-md border border-ink-line bg-transparent px-2 py-1.5 font-mono text-xs text-ink-foreground" />
          </label>
        ))}
      </div>
      {near && <p className="mt-2 text-xs text-ink-muted">Closest studio filament: <span className="inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: near.hex }} /> <span className="text-ink-foreground">{near.name}</span></p>}
    </div>
  );
}

function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button type="button" aria-pressed={on} title={title} onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-ink-foreground text-ink" : "border border-ink-line text-ink-muted hover:text-ink-foreground"}`}>{children}</button>
  );
}

function ShapeIcon({ shape }: { shape: ShapeId }) {
  const p: Record<ShapeId, ReactNode> = {
    custom: <path d="M8 4h8M9 4c-3 5 3 7 0 16M15 4c3 5-3 7 0 16M8 20h8" />,
    classic: <path d="M7 20h10M8 20c-2-5 0-9 1-12h6c1 3 3 7 1 12" />,
    cylinder: <rect x="6" y="5" width="12" height="15" rx="1" />,
    sphere: <circle cx="12" cy="12" r="7.5" />,
    cone: <path d="M5 20h14l-3-15H8z" />,
    dome: <path d="M4 18a8 8 0 0 1 16 0z" />,
    donut: <><ellipse cx="12" cy="14" rx="8" ry="4" /><ellipse cx="12" cy="14" rx="3" ry="1.4" /></>,
    box: <path d="M5 8l7-3 7 3v9l-7 3-7-3zM5 8l7 3 7-3M12 11v9" />,
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>{p[shape]}</svg>;
}

function ShapePicker({ value, onChange, allowNone }: { value: ShapeId | "none"; onChange: (s: ShapeId | "none") => void; allowNone?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {allowNone && <Chip on={value === "none"} onClick={() => onChange("none")}>No base</Chip>}
      {SHAPES.filter((s) => !allowNone || s.id !== "custom").map((s) => (
        <button key={s.id} type="button" aria-pressed={value === s.id} title={s.label} onClick={() => onChange(s.id)}
          className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-[10px] transition-colors ${value === s.id ? "border-primary bg-primary/15 text-ink-foreground" : "border-ink-line text-ink-muted hover:text-ink-foreground"}`}>
          <ShapeIcon shape={s.id} />{s.label}
        </button>
      ))}
    </div>
  );
}

function ModuleEditor({ d, set, sel, setSel }: { d: Design; set: (p: Partial<Design>) => void; sel: number; setSel: (i: number) => void }) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const mods = d.modules;
  const idx = Math.min(sel, mods.length - 1);
  const cur = mods[idx];
  const update = (p: Partial<StackModule>) => set({ modules: mods.map((m, i) => (i === idx ? { ...m, ...p } : m)) });
  const push = (m: StackModule) => { if (mods.length < MAX_MODULES) { set({ modules: [...mods, m] }); setSel(mods.length); } };
  const add = (shape: ShapeId) => push(shape === "custom" ? { ...CUSTOM_MODULE, width: cur?.width ?? 18 } : { shape, height: shape === "donut" ? 6 : 12, width: cur?.width ?? 18, color: null });
  const lathe = cur && cur.shape !== "box" && cur.shape !== "donut";
  // Modules are stored bottom→top; the list shows them top→bottom like the real stack.
  const move = (from: number, to: number) => {
    if (to < 0 || to >= mods.length || from === to) return;
    const next = [...mods];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m!);
    set({ modules: next });
    setSel(to);
  };
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-ink-muted">Add a module</p>
        <button type="button" disabled={mods.length >= MAX_MODULES} onClick={() => add("custom")}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary px-3 py-2.5 text-xs font-semibold text-ink-foreground transition-colors hover:bg-primary/15 disabled:opacity-30">
          <PencilLine className="h-3.5 w-3.5" /> Design my own module
        </button>
        <div className="flex flex-wrap gap-1.5">
          {SHAPES.filter((s) => s.id !== "custom").map((s) => (
            <button key={s.id} type="button" disabled={mods.length >= MAX_MODULES} onClick={() => add(s.id)} title={`Add ${s.label}`}
              className="flex items-center gap-1 rounded-lg border border-ink-line px-2 py-1.5 text-[11px] text-ink-muted transition-colors hover:border-primary hover:text-ink-foreground disabled:opacity-30">
              <Plus className="h-3 w-3" /><ShapeIcon shape={s.id} />{s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-ink-muted">
          <span>Your stack · drag to reorder</span><span className="text-[10px]">{mods.length}/{MAX_MODULES}</span>
        </div>
        <ol className="flex flex-col gap-1.5">
          {mods.map((m, i) => ({ m, i })).reverse().map(({ m, i }) => (
            <li key={i} draggable onDragStart={() => setDragFrom(i)} onDragEnd={() => setDragFrom(null)}
              onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragFrom !== null) move(dragFrom, i); setDragFrom(null); }}
              onClick={() => setSel(i)}
              className={`flex cursor-grab items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors active:cursor-grabbing ${i === idx ? "border-primary bg-primary/10" : "border-ink-line hover:border-ink-foreground"} ${dragFrom === i ? "opacity-40" : ""}`}>
              <GripVertical className="h-3.5 w-3.5 text-ink-muted" />
              <ShapeIcon shape={m.shape} />
              <span className="flex-1">{SHAPES.find((s) => s.id === m.shape)?.label} · {m.height}×{m.width} cm</span>
              <span className="h-3 w-3 rounded-full border border-ink-line" style={{ background: m.color ?? d.color }} />
              <button type="button" aria-label="Move up" onClick={(e) => { e.stopPropagation(); move(i, i + 1); }} disabled={i === mods.length - 1} className="rounded p-0.5 disabled:opacity-20"><ChevronUp className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Move down" onClick={(e) => { e.stopPropagation(); move(i, i - 1); }} disabled={i === 0} className="rounded p-0.5 disabled:opacity-20"><ChevronDown className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Remove module" onClick={(e) => { e.stopPropagation(); if (mods.length > 1) { set({ modules: mods.filter((_, k) => k !== i) }); setSel(Math.max(0, i - 1)); } }} disabled={mods.length <= 1} className="rounded p-0.5 disabled:opacity-20"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ol>
      </div>
      {cur && (
        <div className="space-y-4 rounded-xl bg-ink-soft p-4">
          <p className="text-xs uppercase tracking-widest text-ink-muted">Design the selected module</p>
          <ShapePicker value={cur.shape} onChange={(s) => s !== "none" && update({ shape: s })} />
          <Slider label="Height" value={cur.height} min={3} max={40} step={1} onChange={(v) => update({ height: v })} show={`${cur.height} cm`} />
          <Slider label="Width" value={cur.width} min={6} max={40} step={1} onChange={(v) => update({ width: v })} show={`${cur.width} cm`} />
          {cur.shape === "custom" && <Slider label="Taper" value={cur.taper ?? 0} min={-0.7} max={0.7} step={0.01} onChange={(v) => update({ taper: v })} show={(cur.taper ?? 0).toFixed(2)} />}
          {lathe && <PointsEditor pts={cur.points ?? []} onChange={(points) => update({ points })} />}
          <div className="flex items-center gap-3 text-xs text-ink-muted">
            <label className="flex items-center gap-2"><input type="checkbox" checked={cur.color !== null} onChange={(e) => update({ color: e.target.checked ? d.color : null })} className="accent-primary" /> Own colour</label>
            {cur.color && <input type="color" value={cur.color} onChange={(e) => update({ color: e.target.value })} aria-label="Module colour" className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent" />}
            <button type="button" disabled={mods.length >= MAX_MODULES} onClick={() => { set({ modules: [...mods, { ...cur }] }); setSel(mods.length); }} className="ml-auto inline-flex items-center gap-1 rounded-full border border-ink-line px-3 py-1 font-semibold disabled:opacity-30"><Copy className="h-3 w-3" />Duplicate</button>
            <button type="button" disabled={mods.length >= MAX_MODULES} onClick={() => { set({ modules: [...mods, ...Array(MAX_MODULES - mods.length).fill(null).map(() => ({ ...cur }))] }); }} className="rounded-full border border-ink-line px-3 py-1 font-semibold disabled:opacity-30">Repeat to fill</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PointsEditor({ pts, onChange }: { pts: TouchPoint[]; onChange: (p: TouchPoint[]) => void }) {
  const set = (p: { points: TouchPoint[] }) => onChange(p.points);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-ink-muted">Touch points <span className="normal-case tracking-normal">({pts.length}/{MAX_POINTS})</span></p>
        <button type="button" disabled={pts.length >= MAX_POINTS} onClick={() => set({ points: [...pts, { t: pts.length ? Math.min(0.9, Math.max(...pts.map((p) => p.t)) + 0.15) : 0.5, s: 0.8 }] })}
          className="rounded-full border border-ink-line px-2.5 py-1 text-[11px] font-semibold disabled:opacity-30"><Plus className="mr-0.5 inline h-3 w-3" />Add point</button>
      </div>
      {pts.map((p, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
          <Slider label={`${i + 1} · Position`} value={p.t} min={0.08} max={0.92} step={0.01} onChange={(v) => set({ points: pts.map((q, k) => (k === i ? { ...q, t: v } : q)) })} show={`${Math.round(p.t * 100)}%`} />
          <Slider label="Width" value={p.s} min={0.25} max={1.6} step={0.01} onChange={(v) => set({ points: pts.map((q, k) => (k === i ? { ...q, s: v } : q)) })} show={`${Math.round(p.s * 100)}%`} />
          <button type="button" aria-label={`Remove point ${i + 1}`} onClick={() => set({ points: pts.filter((_, k) => k !== i) })} className="mb-1 rounded-full border border-ink-line p-1"><Minus className="h-3 w-3" /></button>
        </div>
      ))}
      {pts.length > 0 && <p className="text-[11px] text-ink-muted">Tip: drag the glowing dots on the model to pinch or swell it.</p>}
    </div>
  );
}

const TABS = [
  { id: "shape", label: "Shape" },
  { id: "surface", label: "Surface" },
  { id: "colour", label: "Colour" },
  { id: "extras", label: "Light & water" },
] as const;

function Sandbox({ design: d, setDesign, rates, note, sendLabel, onSend }: { design: Design; setDesign: (d: Design) => void; rates: Rates; note: string; sendLabel: string; onSend: () => void }) {
  const set = (p: Partial<Design>) => setDesign({ ...d, ...p });
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("shape");
  const [sel, setSel] = useState(0);
  const selIdx = Math.min(sel, d.modules.length - 1);
  const fit = lightFitting(d);
  const spec = estimate(d, rates);
  const form = FORMS.find((f) => f.id === d.form)!;
  const shuffle = () => set({
    taper: +(Math.random() * 1.4 - 0.7).toFixed(2), twist: Math.round(Math.random() * 360), fuzzy: +Math.random().toFixed(2),
    layers: Math.round(Math.random() * 50), hRibs: Math.random() > 0.6 ? Math.round(Math.random() * 20) : 0,
    points: POINT_PRESETS[Math.floor(Math.random() * POINT_PRESETS.length)]?.points ?? [],
    color: STUDIO_PALETTE[Math.floor(Math.random() * STUDIO_PALETTE.length)]?.hex ?? d.color,
  });
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
      {/* Controls */}
      <div className="order-2 flex flex-col rounded-2xl border border-ink-line md:order-1 md:h-[640px]">
        <div className="flex flex-wrap gap-2 border-b border-ink-line p-4">
          {FORMS.map((f) => (
            <Chip key={f.id} on={d.form === f.id} onClick={() => set({ form: f.id, light: f.light ? d.light : false, waterproof: f.water ? d.waterproof : false })}>{f.label}</Chip>
          ))}
        </div>
        <div role="tablist" className="flex border-b border-ink-line text-xs font-semibold">
          {TABS.map((t) => (
            <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`flex-1 border-b-2 px-2 py-3 transition-colors ${tab === t.id ? "border-primary text-ink-foreground" : "border-transparent text-ink-muted hover:text-ink-foreground"}`}>{t.label}</button>
          ))}
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {tab === "shape" && (d.form === "stack" ? <ModuleEditor d={d} set={set} sel={selIdx} setSel={setSel} /> : (
            <>
              <Slider label="Height" value={d.height} min={8} max={45} step={1} onChange={(v) => set({ height: v })} show={`${d.height} cm`} />
              <Slider label="Width" value={d.width} min={8} max={40} step={1} onChange={(v) => set({ width: v })} show={`${d.width} cm`} />
              <Slider label="Taper" value={d.taper} min={-0.7} max={0.7} step={0.01} onChange={(v) => set({ taper: v })} show={d.taper.toFixed(2)} />
              {d.form === "table-lamp" && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-ink-muted">Base</p>
                  <ShapePicker value={d.base} onChange={(s) => set({ base: s })} allowNone />
                </div>
              )}
              <PointsEditor pts={d.points} onChange={(points) => set({ points })} />
            </>
          ))}
          {tab === "surface" && (
            <>
              <Slider label="Twist" value={d.twist} min={0} max={720} step={5} onChange={(v) => set({ twist: v })} show={`${d.twist}°`} />
              <Slider label="Fuzzy skin" value={d.fuzzy} min={0} max={1} step={0.01} onChange={(v) => set({ fuzzy: v })} show={d.fuzzy < 0.05 ? "Off" : d.fuzzy < 0.4 ? "Soft" : d.fuzzy < 0.75 ? "Medium" : "Heavy"} />
              <Slider label="Vertical ribs" value={d.layers} min={0} max={60} step={1} onChange={(v) => set({ layers: v })} show={d.layers ? String(d.layers) : "Off"} />
              <Slider label="Horizontal ribs" value={d.hRibs} min={0} max={40} step={1} onChange={(v) => set({ hRibs: v })} show={d.hRibs ? String(d.hRibs) : "Off"} />
            </>
          )}
          {tab === "colour" && <ColorPanel value={d.color} onChange={(color) => set({ color })} label="Pick your colour" />}
          {tab === "extras" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Toggle on={d.light} disabled={!form.light} onClick={() => set({ light: !d.light })} icon={<Lightbulb className="h-3.5 w-3.5" />} label={d.light ? "Light on" : "Light off"} />
                {d.light && form.light && <Toggle on={d.warm} onClick={() => set({ warm: !d.warm })} icon={null} label={d.warm ? "Warm 2200K" : "Soft 3000K"} />}
                <Toggle on={d.waterproof} disabled={!form.water} onClick={() => set({ waterproof: !d.waterproof })} icon={<Droplets className="h-3.5 w-3.5" />} label="Waterproof" />
              </div>
              {d.form === "stack" && d.light && (
                <div className="space-y-3 rounded-xl bg-ink-soft p-4">
                  <p className="text-xs uppercase tracking-widest text-ink-muted">Where should the light sit?</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-ink-muted">
                    {(["lightFrom", "lightTo"] as const).map((k) => (
                      <label key={k} className="block">{k === "lightFrom" ? "From module" : "To module"}
                        <select value={k === "lightFrom" ? fit.from : fit.to} onChange={(e) => set({ [k]: +e.target.value })}
                          className="mt-1 w-full rounded-md border border-ink-line bg-ink px-2 py-1.5 text-ink-foreground">
                          {d.modules.map((m, i) => <option key={i} value={i}>{i + 1} · {SHAPES.find((s) => s.id === m.shape)?.label}{i === 0 ? " (bottom)" : i === d.modules.length - 1 ? " (top)" : ""}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  {fit.count > 1 && (
                    <div className="flex gap-2">
                      <Chip on={d.lightKind === "strip"} onClick={() => set({ lightKind: "strip" })}>LED strip</Chip>
                      <Chip on={d.lightKind === "tube"} onClick={() => set({ lightKind: "tube" })}>Tube light</Chip>
                    </div>
                  )}
                  <p className="text-xs text-ink-muted">Lights {fit.count} module{fit.count > 1 ? "s" : ""} · fitting: <span className="font-semibold text-ink-foreground">{fit.fitting}</span></p>
                </div>
              )}
              {!form.light && <p className="text-xs text-ink-muted">Lighting is available for pendants, table lamps and stacks.</p>}
              {d.waterproof && <p className="text-xs text-ink-muted">Adds {rates.waterproofLoops} extra wall loops ({wallLoops(d, rates)} total) — heavier, but holds water.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Model + estimate */}
      <div className="order-1 space-y-4 md:sticky md:top-24 md:order-2 md:self-start">
        <div className="relative h-[420px] overflow-hidden rounded-2xl bg-ink-soft md:h-[470px]">
          <Three><StudioModel design={d} onPoints={(points) => set({ points })} active={d.form === "stack" ? selIdx : undefined}
            onModulePoints={(i, points) => set({ modules: d.modules.map((m, k) => (k === i ? { ...m, points } : m)) })} /></Three>
          <button type="button" onClick={shuffle} className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-transform hover:rotate-3 hover:scale-105"><Shuffle className="h-3.5 w-3.5" /> Surprise me</button>
          <span className="absolute left-4 top-4 h-6 w-6 rounded-full border border-ink-line" style={{ background: d.color }} title={d.color} />
          <p className="pointer-events-none absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-ink-muted">Drag to spin · scroll to zoom{(d.form !== "stack" ? d.points.length : d.modules[selIdx]?.points?.length) ? " · drag dots to shape" : ""}</p>
        </div>
        <div className="rounded-2xl bg-ink-foreground p-4 text-ink">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-60">Live estimate</p>
              <p className="font-display text-2xl font-bold tabular-nums">{formatPrice(spec.low)} – {formatPrice(spec.high)}</p>
            </div>
            <button type="button" onClick={onSend} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">{sendLabel} <ArrowRight className="h-4 w-4" /></button>
          </div>
          <dl className="mt-3 grid grid-cols-4 gap-2 text-xs">
            <div><dt className="opacity-60">Size</dt><dd className="font-semibold tabular-nums">{spec.totalHeight}×{spec.width} cm</dd></div>
            <div><dt className="opacity-60">Weight</dt><dd className="font-semibold tabular-nums">~{spec.grams} g</dd></div>
            <div><dt className="opacity-60">Print</dt><dd className="font-semibold tabular-nums">~{spec.hours} h</dd></div>
            <div><dt className="opacity-60">Walls</dt><dd className="font-semibold tabular-nums">{spec.loops} loops</dd></div>
          </dl>
          <p className="mt-2 text-[10px] opacity-60">{note}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Photo to 3D ---------- */

/** Shrinks a photo to a JPEG data URL small enough to send for analysis. */
function toDataUrl(file: File, max = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(im.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    im.onerror = reject;
    im.src = URL.createObjectURL(file);
  });
}

function PhotoLab({ color }: { color: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<PhotoMode>("object");
  const [depth, setDepth] = useState(0.5);
  const [tinted, setTinted] = useState(false);
  const [drag, setDrag] = useState(false);
  const [model, setModel] = useState<PhotoObject | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysed = useRef<File | null>(null);
  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);
  const take = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setSrc(URL.createObjectURL(f)); setModel(null); setError(null); analysed.current = null;
  };
  useEffect(() => {
    if (mode !== "object" || !file || analysed.current === file) return;
    analysed.current = file;
    let live = true;
    setBusy(true); setError(null);
    toDataUrl(file).then((image) => analyzeObjectPhoto({ data: { image } })).then((r) => {
      if (!live) return;
      if (r.ok) setModel(r.model); else setError(r.error);
    }).catch(() => live && setError("We couldn't analyse that photo. Please try another one.")).finally(() => live && setBusy(false));
    return () => { live = false; };
  }, [mode, file]);
  const hint = PHOTO_MODES.find((m) => m.id === mode)!.hint;
  return (
    <div>
      <div role="radiogroup" aria-label="What should your photo become?" className="mb-3 inline-flex rounded-full border border-border p-1">
        {PHOTO_MODES.map((m) => (
          <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${mode === m.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>{m.label}</button>
        ))}
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{hint}</p>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
        className={`relative h-[400px] overflow-hidden rounded-2xl border-2 border-dashed bg-ink transition-colors ${drag ? "border-primary" : "border-border"}`}>
        {src ? <Three><PhotoRelief src={src} depth={depth} color={color} tinted={tinted} mode={mode} model={model} /></Three> : (
          <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-3 text-ink-muted transition-colors hover:text-ink-foreground">
            <Upload className="h-10 w-10" />
            <span className="text-sm font-semibold">Drop a photo or tap to upload</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => take(e.target.files?.[0])} />
          </label>
        )}
        {src && mode === "object" && (busy || error) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/70 p-6 text-center text-ink-foreground backdrop-blur-sm">
            {busy ? <><div className="flex flex-col-reverse">{[0, 1, 2, 3].map((k) => <span key={k} className="layer-in -mt-1 block h-3 rounded-full bg-primary" style={{ width: 56 - k * 10, animationDelay: `${k * 220}ms`, animationIterationCount: "infinite" }} />)}</div><p className="text-sm">Looking at your photo and modelling it…</p></>
              : <p className="max-w-xs text-sm">{error}</p>}
          </div>
        )}
        {src && <img src={src} alt="Your photo" className="absolute bottom-3 right-3 h-16 w-16 rounded-lg border border-ink-line object-cover" />}
      </div>
      {model && mode === "object" && !busy && (
        <p className="mt-3 text-sm"><span className="font-semibold">{model.name}</span> · ~{Math.round(model.height_cm)} cm — <span className="text-muted-foreground">{model.summary}</span></p>
      )}
      {src && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {mode !== "object" && (
            <label className="flex flex-1 items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">{mode === "lithophane" ? "Thickness" : "Depth"}
              <input type="range" min={0.1} max={1.2} step={0.05} value={depth} onChange={(e) => setDepth(+e.target.value)} className="flex-1 accent-primary" />
            </label>
          )}
          {mode === "relief" && <button type="button" onClick={() => setTinted(!tinted)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">{tinted ? "Show photo colours" : "Tint with sandbox colour"}</button>}
          <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold">Change photo<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => take(e.target.files?.[0])} /></label>
        </div>
      )}
    </div>
  );
}

/* ---------- Sketch to 3D ---------- */

type SketchShape = { radii: number[]; aspect: number };

/** Reads an image or canvas into a luminance grid and traces its outline into a turned profile. */
function traceSketch(source: CanvasImageSource, w: number, h: number): SketchShape | null {
  const N = 200, k = Math.min(N / w, N / h);
  const cw = Math.max(8, Math.round(w * k)), ch = Math.max(8, Math.round(h * k));
  const c = document.createElement("canvas"); c.width = cw; c.height = ch;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(source, 0, 0, cw, ch);
  const px = ctx.getImageData(0, 0, cw, ch).data;
  const lum = new Float32Array(cw * ch);
  for (let i = 0; i < lum.length; i++) lum[i] = (px[i * 4]! * 0.299 + px[i * 4 + 1]! * 0.587 + px[i * 4 + 2]! * 0.114) / 255;
  return sketchProfile(lum, cw, ch);
}

function SketchLab({ before, after, color }: { before: string; after: string; color: string }) {
  const [view, setView] = useState<"example" | "draw" | "result">("example");
  const [shape, setShape] = useState<SketchShape | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pad = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const finish = (sh: SketchShape | null, url: string) => {
    if (!sh) { setError("We couldn't find a clear outline — try a darker line on a light background."); return; }
    setError(null); setShape(sh); setPreview(url); setView("result");
  };
  const upload = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    const im = new Image();
    im.onload = () => finish(traceSketch(im, im.width, im.height), url);
    im.src = url;
  };
  const clearPad = () => { const c = pad.current; if (!c) return; const x = c.getContext("2d")!; x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); };
  useEffect(() => { if (view === "draw") clearPad(); }, [view]);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height }; };
  const stroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!e.buttons || !last.current) return;
    const p = point(e), x = e.currentTarget.getContext("2d")!;
    // Mirror each stroke so the outline is symmetric, like a turned piece.
    const W = e.currentTarget.width;
    x.strokeStyle = "#1d1b1a"; x.lineWidth = 6; x.lineCap = "round";
    for (const m of [false, true]) { x.beginPath(); x.moveTo(m ? W - last.current.x : last.current.x, last.current.y); x.lineTo(m ? W - p.x : p.x, p.y); x.stroke(); }
    last.current = p;
  };
  const tools = [
    { label: "Upload your sketch", icon: <Upload className="h-4 w-4" />, upload: true },
    { label: "Draw a sketch", icon: <PencilLine className="h-4 w-4" />, onClick: () => { setView("draw"); setError(null); } },
    { label: "Show example", icon: <Eraser className="h-4 w-4" />, onClick: () => { setView("example"); setError(null); } },
  ];
  return (
    <div className="mt-10 flex gap-3 md:gap-4">
      <div className="flex flex-col gap-2">
        {tools.map((t) => t.upload ? (
          <label key={t.label} title={t.label} aria-label={t.label} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink-line transition-colors hover:border-primary hover:text-primary">
            {t.icon}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        ) : (
          <button key={t.label} type="button" title={t.label} aria-label={t.label} onClick={t.onClick}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line transition-colors hover:border-primary hover:text-primary">{t.icon}</button>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        {view === "example" && <BeforeAfter before={before} after={after} />}
        {view === "draw" && (
          <div className="grid gap-3 md:grid-cols-2">
            <canvas ref={pad} width={480} height={480} aria-label="Sketch pad" className="aspect-square w-full cursor-crosshair touch-none rounded-2xl"
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); last.current = point(e); }} onPointerMove={stroke} onPointerUp={() => (last.current = null)} />
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-ink-line p-6">
              <p className="text-sm text-ink-muted">Draw one side of your vase or lamp from top to bottom — we mirror it as you go. Then turn it into 3D.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { const c = pad.current; if (c) finish(traceSketch(c, c.width, c.height), c.toDataURL()); }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]">Make it 3D <ArrowRight className="h-4 w-4" /></button>
                <button type="button" onClick={clearPad} className="rounded-full border border-ink-line px-4 py-2.5 text-sm font-semibold">Clear</button>
              </div>
            </div>
          </div>
        )}
        {view === "result" && shape && preview && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-foreground">
              <img src={preview} alt="Your sketch" className="h-full w-full object-contain" />
              <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs text-ink-foreground">Your sketch</span>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-soft">
              <Three><SketchModel radii={shape.radii} aspect={shape.aspect} color={color} /></Three>
              <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs text-ink-foreground">3D preview · drag to spin</span>
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-ink-muted">{error}</p>}
      </div>
    </div>
  );
}

/* ---------- Before / after ---------- */

function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const move = (x: number) => { const r = ref.current!.getBoundingClientRect(); setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))); };
  return (
    <div ref={ref} className="relative aspect-[4/3] cursor-ew-resize select-none overflow-hidden rounded-2xl touch-none"
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
  const shape = d.form === "stack"
    ? ` · modules (bottom→top): ${d.modules.map((m) => `${SHAPES.find((x) => x.id === m.shape)?.label} ${m.height}×${m.width}${m.points?.length ? ` pts ${m.points.map((p) => `${Math.round(p.t * 100)}%@${Math.round(p.s * 100)}%`).join(" ")}` : ""}${m.color ? ` ${m.color}` : ""}`).join(", ")}${d.light ? ` · light modules ${lightFitting(d).from + 1}–${lightFitting(d).to + 1} (${lightFitting(d).fitting})` : ""}`
    : `${d.points.length ? ` · touch points ${d.points.map((p) => `${Math.round(p.t * 100)}%@${Math.round(p.s * 100)}%`).join(" ")}` : ""}${d.form === "table-lamp" ? ` · base ${d.base === "none" ? "none" : SHAPES.find((x) => x.id === d.base)?.label}` : ""}`;
  return `${FORMS.find((f) => f.id === d.form)!.label} · ${s.totalHeight}×${s.width} cm · fuzzy ${Math.round(d.fuzzy * 100)}% · ${d.layers} vertical / ${d.hRibs} horizontal ribs · twist ${d.twist}° · taper ${d.taper} · ${d.color}${d.light ? ` · light ${d.warm ? "warm" : "soft"}` : ""}${d.waterproof ? " · waterproof" : ""}${shape} · est. ₹${s.low}–${s.high}`;
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
        <label className={lbl}>Preferred colour or palette<input name="color" defaultValue={design?.color ?? ""} className={field} placeholder="e.g. warm sand, forest green" />{err("color")}</label>
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
