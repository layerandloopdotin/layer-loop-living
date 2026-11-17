import { useSyncExternalStore } from "react";
import { sameEngraving, type Engraving } from "@/lib/engraving";

export type CartLine = { slug: string; qty: number; variant?: string; engraving?: Engraving };
const same = (c: CartLine, slug: string, variant?: string, engraving?: Engraving) => c.slug === slug && (c.variant ?? "") === (variant ?? "") && sameEngraving(c.engraving, engraving);
type State = { cart: CartLine[]; wishlist: string[] };

const KEY = "ll-shop-v1";
const empty: State = { cart: [], wishlist: [] };
let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...empty, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

function set(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useShop() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => (load(), state),
    () => empty,
  );
}

export const shop = {
  add(slug: string, qty = 1, variant?: string, engraving?: Engraving) {
    load();
    const found = state.cart.find((c) => same(c, slug, variant, engraving));
    set({
      ...state,
      cart: found
        ? state.cart.map((c) => (same(c, slug, variant, engraving) ? { ...c, qty: Math.min(10, c.qty + qty) } : c))
        : [...state.cart, { slug, qty, ...(variant ? { variant } : {}), ...(engraving ? { engraving } : {}) }],
    });
  },
  setQty(slug: string, qty: number, variant?: string, engraving?: Engraving) {
    load();
    set({
      ...state,
      cart: qty <= 0 ? state.cart.filter((c) => !same(c, slug, variant, engraving)) : state.cart.map((c) => (same(c, slug, variant, engraving) ? { ...c, qty: Math.min(10, qty) } : c)),
    });
  },
  toggleWish(slug: string) {
    load();
    set({
      ...state,
      wishlist: state.wishlist.includes(slug) ? state.wishlist.filter((s) => s !== slug) : [...state.wishlist, slug],
    });
  },
};
