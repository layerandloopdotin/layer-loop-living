import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Swipe rail that centres one item, with softer neighbours on both sides, plus arrows and dots. */
export function CenterRail({ children, itemClass = "w-[70%]", edgeClass = "w-[15%]", start, dark = false, className = "" }: {
  children: ReactNode; itemClass?: string; edgeClass?: string; start?: number; dark?: boolean; className?: string;
}) {
  const items = Children.toArray(children);
  const ref = useRef<HTMLDivElement>(null);
  const first = Math.min(start ?? Math.floor((items.length - 1) / 2), Math.max(items.length - 1, 0));
  const [active, setActive] = useState(first);
  const activeRef = useRef(first);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const go = (n: number, smooth = true) => {
    const el = ref.current; const child = el?.querySelectorAll<HTMLElement>("[data-rail-item]")[n];
    if (!el || !child) return;
    el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  };
  useEffect(() => { go(first, false); setActive(first); }, [items.length, first]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => go(activeRef.current, false));
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length]);
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0, dist = Infinity;
    el.querySelectorAll<HTMLElement>("[data-rail-item]").forEach((h, n) => { const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = n; } });
    activeRef.current = best;
    setActive(best);
  };
  if (!items.length) return null;
  const line = dark ? "border-ink-line" : "border-border";
  return (
    <div className={className}>
      <div ref={ref} onScroll={onScroll}
        onPointerDown={(e) => { if (e.pointerType === "mouse") drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false }; }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !e.buttons) return;
          if (Math.abs(e.clientX - d.x) > 6) { d.moved = true; e.currentTarget.style.scrollSnapType = "none"; e.currentTarget.scrollLeft = d.left - (e.clientX - d.x); }
        }}
        onPointerUp={(e) => { e.currentTarget.style.scrollSnapType = ""; }}
        onPointerLeave={(e) => { drag.current = null; e.currentTarget.style.scrollSnapType = ""; }}
        onClickCapture={(e) => { if (drag.current?.moved) { e.preventDefault(); e.stopPropagation(); } drag.current = null; }}
        onDragStart={(e) => e.preventDefault()}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto py-3 [scrollbar-width:none] md:cursor-grab md:active:cursor-grabbing">
        <div aria-hidden className={`${edgeClass} -mr-3 shrink-0`} />
        {items.map((it, n) => (
          <div key={n} data-rail-item data-active={n === active} className={`${itemClass} shrink-0 snap-center transition-all duration-500 motion-reduce:transition-none ${n === active ? "scale-100" : "scale-[0.88] opacity-60 blur-[1.5px]"}`}>{it}</div>
        ))}
        <div aria-hidden className={`${edgeClass} -ml-3 shrink-0`} />
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button type="button" variant="ghost" size="icon" aria-label="Previous" title="Previous" disabled={active === 0} onClick={() => go(Math.max(active - 1, 0))} className={`rounded-full border ${line}`}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex gap-1.5">
            {items.map((_, n) => <Button type="button" variant="ghost" key={n} aria-label={`Go to item ${n + 1}`} aria-pressed={n === active} onClick={() => go(n)} className="h-8 w-6 p-0"><span className={`h-1.5 rounded-full transition-all ${n === active ? "w-6 bg-primary" : `w-1.5 ${dark ? "bg-ink-line" : "bg-border"}`}`} /></Button>)}
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Next" title="Next" disabled={active === items.length - 1} onClick={() => go(Math.min(active + 1, items.length - 1))} className={`rounded-full border ${line}`}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
