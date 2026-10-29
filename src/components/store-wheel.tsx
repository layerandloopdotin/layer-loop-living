import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Straight, front-facing photo strip: slides stay flat and upright, the row
 * slides sideways. Drag / swipe to move, arrows and scroll wheel also work.
 */
export function StoreWheel({ images, alt }: { images: string[]; alt: string }) {
  const n = images.length;
  const [active, setActive] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const wrap = useRef<HTMLDivElement>(null);
  const slide = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const lock = useRef(0);

  /** Width of one slide plus the gap between slides, in CSS px. */
  const pitch = () => {
    const s = slide.current?.getBoundingClientRect().width ?? 0;
    return s + 24;
  };

  const step = (d: number) =>
    setActive((a) => Math.min(n - 1, Math.max(0, a + d)));

  const onWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 8) return;
    const now = Date.now();
    if (now - lock.current < 450) return;
    lock.current = now;
    step(delta > 0 ? 1 : -1);
  };

  const onDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    setDragPx(e.clientX - startX.current);
  };

  const onUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    setDragging(false);
    setDragPx(0);
    const throwDist = Math.max(40, pitch() * 0.18);
    if (Math.abs(dx) > throwDist) step(dx < 0 ? 1 : -1);
  };

  // Keep the active slide centred when the panel is resized.
  useEffect(() => {
    const onResize = () => setDragPx(0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const containerW = wrap.current?.getBoundingClientRect().width ?? 0;
  const slideW = slide.current?.getBoundingClientRect().width ?? 0;
  const center = (containerW - slideW) / 2;
  const x = center - active * pitch() + dragPx;

  return (
    <div
      ref={wrap}
      className="relative h-[460px] select-none overflow-hidden md:h-[620px]"
      onWheel={onWheel}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ touchAction: "pan-y", cursor: dragging ? "grabbing" : "grab" }}
    >
      <div
        ref={slide}
        className="flex h-full items-center gap-6 will-change-transform"
        style={{
          transform: `translate3d(${x}px,0,0)`,
          transition: dragging ? "none" : "transform 700ms cubic-bezier(.22,1,.36,1)",
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="aspect-[4/5] h-[78%] shrink-0 overflow-hidden rounded-2xl shadow-2xl transition-opacity duration-500 md:h-[74%]"
            style={{ opacity: dragging ? 1 : i === active ? 1 : 0.55 }}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <button
          aria-label="Previous photo"
          onClick={() => step(-1)}
          disabled={active === 0}
          className="rounded-full border border-border bg-background p-2 transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button
          aria-label="Next photo"
          onClick={() => step(1)}
          disabled={active === n - 1}
          className="rounded-full border border-border bg-background p-2 transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
