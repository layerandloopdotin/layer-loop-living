// Which world (Space or Culture) the visitor is browsing. Remembered in the browser.
import { useSyncExternalStore } from "react";
import type { World } from "@/lib/catalog";

const KEY = "ll-world";
const listeners = new Set<() => void>();
let current: World = "space";
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  current = localStorage.getItem(KEY) === "culture" ? "culture" : "space";
}

export function setWorld(w: World) {
  load();
  current = w;
  localStorage.setItem(KEY, w);
  document.documentElement.dataset["world"] = w;
  listeners.forEach((l) => l());
}

export function useWorld(): World {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => { load(); return current; },
    () => "space",
  );
}

/** Apply the remembered world's colours once after hydration. */
export function syncWorldTheme() {
  load();
  document.documentElement.dataset["world"] = current;
}
