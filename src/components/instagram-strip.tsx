import { Instagram } from "lucide-react";
import a from "@/assets/p-mushroom.jpg";
import b from "@/assets/store-2.jpg";
import c from "@/assets/mat-petg.jpg";
import d from "@/assets/tile-vases.jpg";
import e from "@/assets/about-printer.jpg";
import f from "@/assets/p-orb.jpg";
import g from "@/assets/tile-desk.jpg";
import h from "@/assets/living.jpg";
import i from "@/assets/tile-collectibles.jpg";
import j from "@/assets/p-pendant.jpg";

const HANDLE = "layerandloop"; // placeholder handle
const URL = `https://instagram.com/${HANDLE}`;
const posts = [a, b, c, d, e, f, g, h, i, j];

export function InstagramStrip() {
  return (
    <section className="bg-ink py-16 text-ink-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] opacity-60">On Instagram</p>
          <h2 className="mt-2 text-3xl font-bold">@{HANDLE}</h2>
          <p className="mt-2 max-w-md text-sm opacity-70">Fresh off the print bed — new drops, studio moments and your spaces.</p>
        </div>
        <a href={URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-current px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70">
          <Instagram className="h-4 w-4" /> Follow us
        </a>
      </div>
      <div className="mt-10 flex snap-x gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
        {posts.map((src, n) => (
          <a key={n} href={URL} target="_blank" rel="noreferrer" aria-label={`Instagram post ${n + 1}`}
            className="group relative aspect-square w-52 shrink-0 snap-start overflow-hidden rounded-xl md:w-64">
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
              <Instagram className="h-6 w-6" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
