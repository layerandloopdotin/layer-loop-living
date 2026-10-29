import { useSyncExternalStore } from "react";

export type CartLine = { slug: string; qty: number };
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
  add(slug: string, qty = 1) {
    load();
    const found = state.cart.find((c) => c.slug === slug);
    set({
      ...state,
      cart: found
        ? state.cart.map((c) => (c.slug === slug ? { ...c, qty: Math.min(10, c.qty + qty) } : c))
        : [...state.cart, { slug, qty }],
    });
  },
  setQty(slug: string, qty: number) {
    load();
    set({
      ...state,
      cart: qty <= 0 ? state.cart.filter((c) => c.slug !== slug) : state.cart.map((c) => (c.slug === slug ? { ...c, qty: Math.min(10, qty) } : c)),
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
