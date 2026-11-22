// Which world (Space or Culture) the visitor is browsing. Remembered in the browser.
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useSyncExternalStore } from "react";
import type { World } from "@/lib/catalog";
import { useSite } from "@/lib/site";

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
  listeners.forEach((l) => l());
}

export function useWorld(): World {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return current;
    },
    () => "space",
  );
}

/** Apply or clear the document-level world theme attribute. */
export function applyWorldTheme(w: World | null) {
  if (typeof document === "undefined") return;
  if (w) document.documentElement.dataset["world"] = w;
  else delete document.documentElement.dataset["world"];
}

/** Resolve the active visual world from the current route; returns null on neutral pages. */
export function resolveRouteWorld(
  pathname: string,
  search: Record<string, unknown> | undefined,
  storedWorld: World,
  productWorld?: World,
): World | null {
  if (pathname === "/space") return "space";
  if (pathname === "/culture") return "culture";
  if (pathname === "/products") {
    const sw = search?.["world"];
    if (sw === "space" || sw === "culture") return sw;
    const sq = search?.["q"];
    if (typeof sq === "string" && sq.trim()) return null;
    return storedWorld;
  }
  if (pathname.startsWith("/product/")) return productWorld ?? null;
  return null;
}

/** Route-aware active world: returns "space", "culture", or null on neutral studio pages. */
export function useActiveWorld(): World | null {
  const stored = useWorld();
  const site = useSite();
  const { pathname, search } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      search: s.location.search as Record<string, unknown> | undefined,
    }),
  });
  const slug = pathname.startsWith("/product/")
    ? pathname.slice("/product/".length).split("/")[0]
    : "";
  const productWorld = slug ? site.bySlug(slug)?.world : undefined;
  return resolveRouteWorld(pathname, search, stored, productWorld);
}

/** Keep html[data-world] synchronized with the active route world. */
export function useSyncWorldTheme() {
  const active = useActiveWorld();
  useEffect(() => {
    applyWorldTheme(active);
  }, [active]);
}

/** Apply the remembered world's colours once after hydration (legacy alias). */
export function syncWorldTheme() {
  load();
}
