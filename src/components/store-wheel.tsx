import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Looping arc carousel: centre slide largest, neighbours tilt back along a half-circle. */
export function StoreWheel({ images, alt }: { images: string[]; alt: string }) {
  const n = images.length;
  const [active, setActive] = useState(0);
  const lock = useRef(0);
  const drag = useRef<number | null>(null);
  const step = (d: number) => setActive((a) => (a + d + n) % n);

  const onWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 8) return;
    const now = Date.now();
    if (now - lock.current < 550) return;
    lock.current = now;
    step(delta > 0 ? 1 : -1);
  };

  return (
    <div
      className="relative h-[460px] select-none overflow-hidden md:h-[620px]"
      onWheel={onWheel}
      onPointerDown={(e) => (drag.current = e.clientX)}
      onPointerUp={(e) => {
        if (drag.current === null) return;
        const dx = e.clientX - drag.current;
        drag.current = null;
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      }}
      style={{ touchAction: "pan-y" }}
    >
      {images.map((src, i) => {
        let d = i - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        const a = Math.abs(d);
        return (
          <img
            key={i}
            src={src}
            alt={alt}
            draggable={false}
            loading="lazy"
            width={1024}
            height={1280}
            onClick={() => d && step(d)}
            className="absolute left-1/2 top-[6%] aspect-[4/5] w-[56%] cursor-pointer rounded-2xl object-cover shadow-2xl transition-all duration-700 ease-out md:w-[42%]"
            style={{
              transform: `translateX(calc(-50% + ${d * 72}%)) translateY(${a * a * 7}%) rotate(${d * 9}deg) scale(${1 - a * 0.16})`,
              opacity: a > 2 ? 0 : 1 - a * 0.2,
              zIndex: 10 - a,
              filter: a ? "brightness(0.75)" : "none",
              transformOrigin: "50% 100%",
            }}
          />
        );
      })}
      <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <button aria-label="Previous photo" onClick={() => step(-1)} className="rounded-full border border-border bg-background p-2 transition-colors hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-xs tabular-nums text-muted-foreground">{String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
        <button aria-label="Next photo" onClick={() => step(1)} className="rounded-full border border-border bg-background p-2 transition-colors hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
