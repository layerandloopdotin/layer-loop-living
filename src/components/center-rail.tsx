import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Swipe rail that centres one item, with softer neighbours on both sides, plus arrows and dots. */
export function CenterRail({ children, itemClass = "w-[70%]", start, dark = false, className = "" }: {
  children: ReactNode; itemClass?: string; start?: number; dark?: boolean; className?: string;
}) {
  const items = Children.toArray(children);
  const ref = useRef<HTMLDivElement>(null);
  const first = Math.min(start ?? Math.floor((items.length - 1) / 2), Math.max(items.length - 1, 0));
  const [active, setActive] = useState(first);
  const go = (n: number, smooth = true) => {
    const el = ref.current; const child = el?.children[n] as HTMLElement | undefined;
    if (!el || !child) return;
    el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  };
  useEffect(() => { go(first, false); setActive(first); }, [items.length, first]);
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0, dist = Infinity;
    Array.from(el.children).forEach((c, n) => { const h = c as HTMLElement; const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = n; } });
    setActive(best);
  };
  if (!items.length) return null;
  const line = dark ? "border-ink-line" : "border-border";
  return (
    <div className={className}>
      <div ref={ref} onScroll={onScroll} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[15%] py-3 [scrollbar-width:none]">
        {items.map((it, n) => (
          <div key={n} className={`${itemClass} shrink-0 snap-center transition-all duration-500 ${n === active ? "scale-100" : "scale-[0.88] opacity-60 blur-[1.5px]"}`}>{it}</div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button type="button" aria-label="Previous" onClick={() => go(Math.max(active - 1, 0))} className={`rounded-full border p-1.5 ${line}`}><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex gap-1.5">
            {items.map((_, n) => <button type="button" key={n} aria-label={`Go to item ${n + 1}`} onClick={() => go(n)} className={`h-1.5 rounded-full transition-all ${n === active ? "w-6 bg-primary" : `w-1.5 ${dark ? "bg-ink-line" : "bg-border"}`}`} />)}
          </div>
          <button type="button" aria-label="Next" onClick={() => go(Math.min(active + 1, items.length - 1))} className={`rounded-full border p-1.5 ${line}`}><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}
