import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: number) => setI((i + d + n) % n);
  return (
    <div className="md:sticky md:top-24">
      <div className="group relative overflow-hidden rounded-2xl">
        <img key={i} src={images[i]} alt={`${name} — view ${i + 1} of ${n}`} className="aspect-[4/5] w-full object-cover animate-in fade-in duration-300" />
        {n > 1 && (
          <>
            <button aria-label="Previous photo" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 opacity-0 transition group-hover:opacity-100 focus:opacity-100"><ChevronLeft className="h-4 w-4" /></button>
            <button aria-label="Next photo" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 opacity-0 transition group-hover:opacity-100 focus:opacity-100"><ChevronRight className="h-4 w-4" /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1 text-xs">{i + 1} / {n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((src, k) => (
            <button key={k} aria-label={`Show photo ${k + 1}`} aria-pressed={k === i} onClick={() => setI(k)}
              className={`overflow-hidden rounded-lg border-2 transition ${k === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
