import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (d: number) => setI((current) => (current + d + n) % n);
  return (
    <div className="min-w-0 md:sticky md:top-24">
      <div className="group relative overflow-hidden rounded-2xl">
        <img key={i} src={images[i]} alt={`${name} — view ${i + 1} of ${n}`} className="aspect-[4/5] w-full object-cover animate-in fade-in duration-300" />
        {n > 1 && (
          <>
            <Button type="button" variant="outline" size="icon" aria-label="Previous photo" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 md:opacity-0 transition group-hover:opacity-100 focus:opacity-100"><ChevronLeft className="h-4 w-4" /></Button>
            <Button type="button" variant="outline" size="icon" aria-label="Next photo" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 md:opacity-0 transition group-hover:opacity-100 focus:opacity-100"><ChevronRight className="h-4 w-4" /></Button>
            <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1 text-xs">{i + 1} / {n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((src, k) => (
            <Button type="button" variant="ghost" key={k} aria-label={`Show photo ${k + 1}`} aria-pressed={k === i} onClick={() => setI(k)}
              className={`h-auto w-[calc((100%-3rem)/5)] shrink-0 overflow-hidden rounded-lg border-2 p-0 transition ${k === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
